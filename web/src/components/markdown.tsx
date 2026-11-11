import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Trình hiển thị Markdown tối giản (không phụ thuộc thư viện ngoài), style theo DESIGN.md.
 * Hỗ trợ: tiêu đề, danh sách, bảng, code fence, trích dẫn, đường kẻ, **đậm**, *nghiêng*, `code`, [link](url).
 * Không render HTML thô — mọi nội dung đều đi qua React nên an toàn với output của LLM.
 */

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; start: number; items: { text: string; depth: number }[] }
  | { type: "table"; header: string[]; rows: string[][] }
  | { type: "code"; text: string }
  | { type: "quote"; text: string }
  | { type: "hr" };

const LIST_RE = /^(\s*)([-*•]|\d+[.)])\s+(.*)$/;
const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const HR_RE = /^\s*([-*_])(\s*\1){2,}\s*$/;
const TABLE_SEP_RE = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    if (line.trim().startsWith("```")) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) buf.push(lines[i++]);
      i++;
      blocks.push({ type: "code", text: buf.join("\n") });
      continue;
    }

    const heading = HEADING_RE.exec(line);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2].replace(/\s+#+\s*$/, "") });
      i++;
      continue;
    }

    if (HR_RE.test(line)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    if (line.includes("|") && i + 1 < lines.length && TABLE_SEP_RE.test(lines[i + 1])) {
      const header = splitRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) rows.push(splitRow(lines[i++]));
      blocks.push({ type: "table", header, rows });
      continue;
    }

    if (line.trimStart().startsWith(">")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith(">")) buf.push(lines[i++].replace(/^\s*>\s?/, ""));
      blocks.push({ type: "quote", text: buf.join(" ") });
      continue;
    }

    const firstItem = LIST_RE.exec(line);
    if (firstItem) {
      const ordered = /\d/.test(firstItem[2]);
      const baseIndent = firstItem[1].length;
      const items: { text: string; depth: number }[] = [];
      while (i < lines.length) {
        const match = LIST_RE.exec(lines[i]);
        if (match) {
          items.push({ text: match[3], depth: Math.min(2, Math.floor(Math.max(0, match[1].length - baseIndent) / 2)) });
          i++;
        } else if (lines[i].trim() && /^\s{2,}/.test(lines[i]) && items.length > 0) {
          // dòng nối tiếp của item trước
          items[items.length - 1].text += ` ${lines[i].trim()}`;
          i++;
        } else {
          break;
        }
      }
      blocks.push({ type: "list", ordered, start: ordered ? parseInt(firstItem[2], 10) || 1 : 1, items });
      continue;
    }

    const buf: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !HEADING_RE.test(lines[i]) &&
      !LIST_RE.test(lines[i]) &&
      !HR_RE.test(lines[i]) &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trimStart().startsWith(">")
    ) {
      buf.push(lines[i++].trim());
    }
    blocks.push({ type: "paragraph", text: buf.join("\n") });
  }

  return blocks;
}

const INLINE_RE = /(\*\*[^*]+?\*\*|__[^_]+?__|`[^`]+?`|\[[^\]]+?\]\([^)\s]+?\)|\*[^*\s][^*]*?\*)/g;

function isSafeHref(href: string): boolean {
  return href.startsWith("/") || /^https?:\/\//i.test(href) || href.startsWith("tel:");
}

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  text.split(INLINE_RE).forEach((part, index) => {
    if (!part) return;
    const key = `${keyPrefix}-${index}`;

    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
      nodes.push(
        <strong key={key} className="font-extrabold text-foreground">
          {renderInline(part.slice(2, -2), key)}
        </strong>,
      );
    } else if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      nodes.push(
        <code key={key} className="rounded-sm border border-border bg-muted px-1 py-px font-mono text-[0.85em] font-semibold">
          {part.slice(1, -1)}
        </code>,
      );
    } else if (part.startsWith("[") && part.endsWith(")")) {
      const match = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
      if (match && isSafeHref(match[2])) {
        const className =
          "font-bold text-foreground underline decoration-primary decoration-[3px] underline-offset-2 transition-colors hover:bg-primary";
        nodes.push(
          match[2].startsWith("/") ? (
            <Link key={key} href={match[2]} className={className}>
              {renderInline(match[1], key)}
            </Link>
          ) : (
            <a key={key} href={match[2]} target="_blank" rel="noopener noreferrer" className={className}>
              {renderInline(match[1], key)}
            </a>
          ),
        );
      } else {
        nodes.push(match ? match[1] : part);
      }
    } else if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      nodes.push(<em key={key}>{renderInline(part.slice(1, -1), key)}</em>);
    } else {
      nodes.push(part);
    }
  });
  return nodes;
}

const HEADING_CLASS: Record<number, string> = {
  1: "text-xl font-extrabold tracking-tight sm:text-2xl",
  2: "text-lg font-extrabold tracking-tight sm:text-xl",
  3: "text-base font-extrabold",
  4: "text-sm font-extrabold uppercase tracking-wide",
};

const DEPTH_CLASS = ["", "ml-5", "ml-10"];

export interface MarkdownProps {
  content: string;
  /** `compact` cho bong bóng chat, `article` cho trang báo cáo dài. */
  size?: "compact" | "article";
  className?: string;
}

export function Markdown({ content, size = "compact", className }: MarkdownProps) {
  const blocks = React.useMemo(() => parseBlocks(content), [content]);
  const article = size === "article";

  return (
    <div
      className={cn(
        "min-w-0 font-medium break-words text-foreground",
        article ? "space-y-4 text-sm leading-relaxed sm:text-base" : "space-y-2.5 text-sm leading-relaxed",
        className,
      )}
    >
      {blocks.map((block, index) => {
        const key = `b${index}`;
        switch (block.type) {
          case "heading": {
            const level = Math.min(block.level + (article ? 0 : 1), 4);
            const Tag = `h${Math.min(level + 1, 6)}` as "h2" | "h3" | "h4" | "h5";
            return (
              <Tag
                key={key}
                className={cn(
                  "font-heading text-foreground",
                  HEADING_CLASS[level],
                  article && level <= 2 && "mt-8 border-b-2 border-border pb-2 first:mt-0",
                  article && level === 3 && "mt-5",
                )}
              >
                {renderInline(block.text, key)}
              </Tag>
            );
          }
          case "paragraph":
            return (
              <p key={key} className="whitespace-pre-line">
                {renderInline(block.text, key)}
              </p>
            );
          case "list": {
            const Tag = block.ordered ? "ol" : "ul";
            return (
              <Tag
                key={key}
                start={block.ordered ? block.start : undefined}
                className={cn("space-y-1.5 pl-5", block.ordered ? "list-decimal marker:font-bold" : "list-disc")}
              >
                {block.items.map((item, itemIndex) => (
                  <li key={`${key}-${itemIndex}`} className={cn("pl-0.5", DEPTH_CLASS[item.depth])}>
                    {renderInline(item.text, `${key}-${itemIndex}`)}
                  </li>
                ))}
              </Tag>
            );
          }
          case "table":
            return (
              <div key={key} className="overflow-x-auto rounded-lg border-2 border-border bg-card shadow-hard-sm">
                <table className="w-full min-w-max border-collapse text-left text-xs sm:text-sm">
                  <thead className="bg-primary text-primary-foreground">
                    <tr>
                      {block.header.map((cell, cellIndex) => (
                        <th key={cellIndex} className="border-b-2 border-border px-3 py-2 font-extrabold">
                          {renderInline(cell, `${key}-h${cellIndex}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-border/20 last:border-b-0 even:bg-muted/50">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="max-w-xs px-3 py-2 align-top">
                            {renderInline(cell, `${key}-r${rowIndex}c${cellIndex}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "code":
            return (
              <pre
                key={key}
                className="overflow-x-auto rounded-lg border-2 border-border bg-muted p-3 font-mono text-xs leading-relaxed font-semibold"
              >
                {block.text}
              </pre>
            );
          case "quote":
            return (
              <blockquote key={key} className="border-l-4 border-primary bg-muted/60 py-2 pr-3 pl-3 font-semibold">
                {renderInline(block.text, key)}
              </blockquote>
            );
          case "hr":
            return <hr key={key} className="border-t-2 border-border" />;
        }
      })}
    </div>
  );
}
