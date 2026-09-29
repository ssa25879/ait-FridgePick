import { Button, Paragraph, Post } from "@toss/tds-mobile";
import type { RefObject } from "react";

interface HomePageProps {
  mainRef: RefObject<HTMLElement>;
  onStart: () => void;
}

export function HomePage({ mainRef, onStart }: HomePageProps) {
  return (
    <main
      ref={mainRef}
      tabIndex={-1}
      className="page"
      aria-labelledby="home-title"
    >
      <section className="page-content">
        <Paragraph.Text className="page-brand" typography="t5" fontWeight="bold">
          냉털픽
        </Paragraph.Text>
        <Post.H1 id="home-title" className="page-title">
          냉장고 속 재료로 오늘 메뉴를 골라보세요
        </Post.H1>
        <Post.Paragraph className="page-description">
          있는 재료를 고르면 만들기 좋은 메뉴를 추천해요.
        </Post.Paragraph>
      </section>
      <div className="page-actions">
        <Button
          type="button"
          color="dark"
          display="full"
          size="xlarge"
          onClick={onStart}
        >
          재료 고르기
        </Button>
      </div>
    </main>
  );
}
