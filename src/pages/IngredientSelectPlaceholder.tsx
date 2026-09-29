import { Button, Post } from "@toss/tds-mobile";

interface IngredientSelectPlaceholderProps {
  onBack: () => void;
}

export function IngredientSelectPlaceholder({
  onBack,
}: IngredientSelectPlaceholderProps) {
  return (
    <main className="page" aria-labelledby="ingredients-title">
      <section className="page-content">
        <Post.H1 id="ingredients-title" className="page-title">
          재료 선택 화면을 준비하고 있어요
        </Post.H1>
        <Post.Paragraph className="page-description">
          재료를 골라 메뉴를 추천받는 기능을 준비하고 있어요.
        </Post.Paragraph>
      </section>
      <div className="page-actions">
        <Button
          type="button"
          color="dark"
          variant="weak"
          display="full"
          size="xlarge"
          onClick={onBack}
        >
          홈으로
        </Button>
      </div>
    </main>
  );
}
