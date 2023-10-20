fetch("./data.json").then(data => data.json()).then(data => {
  const spotlightContainerElement = document.querySelector(".spotlight-container");
  spotlightContainerElement.innerHTML = generateHTML(data);

  const storySwipers = [], autoplayDelay = 3000;

  const spotlightSwiper = new Swiper(spotlightContainerElement, {
    loop: true,
    autoplay: false,
    slidesPerView: 1,
    centeredSlides: true,
    slideToClickedSlide: true,
    breakpoints: {
      768: {
        slidesPerView: 2,
      },
      1366: {
        slidesPerView: 3,
      },
    }
  }).on("slideChangeTransitionEnd", function(swiper) {
    storySwipers[swiper.realIndex]?.autoplay?.start();
    storySwipers[swiper.realIndex]?.autoplay?.resume();
  })
  .on("slideChangeTransitionStart", function(swiper) {
    storySwipers[swiper.previousRealIndex]?.autoplay?.stop();
    storySwipers[swiper.realIndex]?.autoplay?.stop();
  });

  [
    ...spotlightContainerElement.getElementsByClassName("spotlight-slide")
  ].forEach((spotlightSlide) => {
    const realSlideIndex = spotlightSlide.getAttribute("data-swiper-slide-index");
    storySwipers[realSlideIndex] =
      new Swiper(spotlightSlide.querySelector(".story-container"), {
        loop: true,
        init: false,
        autoplay: {
          delay: autoplayDelay,
          disableOnInteraction: false,
          waitForTransition: true
        },
        slidesPerView: 1,
        pagination: {
          el: ".swiper-pagination",
          type: "bullets"
        },
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev"
        }
      })
      .on("afterInit", function(swiper) {
        realSlideIndex != 0 && swiper.autoplay.stop();
      })
      .on("slideNextTransitionStart", function(swiper) {
        if (swiper.realIndex === 0) {
          spotlightSwiper.slideNext();
        }
      })
      .on("slidePrevTransitionStart", function(swiper) {
        if (swiper.realIndex === swiper.slides.length - 1) {
          spotlightSwiper.slidePrev();
        }
      })
      .on("autoplayTimeLeft", function(swiper, timeLeft, progress) {
        document.body.style.setProperty("--story-progress", isNaN(progress) ? 0 : progress.toFixed(3));
      });
    
    storySwipers[realSlideIndex].init();
  });
});

// Function to generate HTML from JSON data
function generateHTML(data) {
  let html = '<div class="swiper-wrapper">';

  data?.stories?.forEach(storyBlock => {
    html += `<div class="swiper-slide spotlight-slide">
      <div class="story-container">
        <div class="swiper-wrapper">`;

    storyBlock.cards.forEach((card) => {
      html += `<div class="swiper-slide">
          <div class="card">
            <div class="card-image">
              <img src="${card.imageSrc}" alt="" />
            </div>
            <div class="card-body">
              <h3 class="card-title">${card.cardTitle}</h3>`;

      if (card.description) {
        html += `<p class="description">${card.description}</p>`;
      }

      html += `</div>
          </div>
        </div>`;
    });

    html += `</div>
        <div class="swiper-pagination"></div>
        <div class="swiper-button-prev"></div>
        <div class="swiper-button-next"></div>
      </div>
    </div>`;
  });

  html += `</div>`;

  return html;
}
