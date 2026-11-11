pd.set_option("display.width", 220, "display.max_colwidth", 80, "display.max_rows", 100)

cov = pivot2.notna().sum().sort_values(ascending=False)
print("Số quán có từng nhóm:")
print(cov.to_string())
print("\nQuán có ≥5 nhóm:", int((pivot2.notna().sum(axis=1) >= 5).sum()), "/", len(pivot2))

sus = cs[cs.so_ten >= 15].sort_values("so_quan", ascending=False)
print("\nNhóm gom nhiều tên khác nhau (≥15), dễ gộp nhầm:")
display(sus[["so_quan", "so_ten", "vi_du"]])