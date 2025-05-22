import React, { useEffect, useRef, useState } from "react";
import stls from "~styles/components/Main.module.sass";
import { LayoutPage } from "~components/general/layout-page";

export default function Coffee() {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null); // Создаем реф для элемента

  const handleScroll = () => {
    if (elementRef.current) {
      const position = elementRef?.current?.getBoundingClientRect();
      // Проверяем, виден ли элемент в области просмотра
      if (position.top < window.innerHeight && position.bottom >= 0) {
        setIsVisible(true);
        window.removeEventListener("scroll", handleScroll); // Удаляем обработчик, чтобы избежать повторного вызова
      }
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll); // Удаляем обработчик при размонтировании компонента
    };
  }, []);

  return (
    <LayoutPage>
      <div
        ref={elementRef}
        className={
          isVisible ? stls.servicesContainer : stls.servicesContainerHidden
        }
      >
        <div>
          <div className={stls.serviceTitle}>
            <h1>Dog-friendly места</h1>
            <img src="friends.png" alt="friends" />
          </div>
          <p>
            📌 Отмечайте на карте dog-friendly кафе и площадки
            <br />
            <br />
            📌 Делитесь своими находками и помогайте другим владельцам сиба-ину
            находить лучшие места для отдыха и прогулок
            <br />
            <br />
            📌 Чекиньтесь на площадках и в кафе, чтобы другие пользователи
            видели, где сейчас тусуются сибы!
          </p>
        </div>
      </div>
    </LayoutPage>
  );
}
