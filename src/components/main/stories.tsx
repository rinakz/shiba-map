import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import stls from "~styles/components/Main.module.sass";

export const Stories = () => {
  const [emblaRef] = useEmblaCarousel({ loop: false }, [Autoplay()]);

  return (
    <div ref={emblaRef} style={{ overflow: "hidden", width: "100%" }}>
      <div style={{ display: "flex", width: "100%" }}>
        {[1, 2, 3].map((el, index) => {
          return (
            <div key={index}>
              <img
                className={stls.story}
                src={`story${index + 1}.png`}
                alt="story"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
