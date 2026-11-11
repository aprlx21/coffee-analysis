import { WelcomeHero } from "@/features/welcome";

// Page chỉ "lắp ráp": lấy component từ feature, không chứa logic nghiệp vụ.
export default function HomePage() {
  return <WelcomeHero />;
}
