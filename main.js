// Fetch data from JSON file
fetch("./data.json")
  .then((data) => data.json())
  .then((data) => {
    const spotlightContainerElement = document.querySelector(".spotlight-container");
    spotlightContainerElement.innerHTML = generateHTML(data);

    const storySwipers = [],
      autoplayDelay = 3000;

    // Initialize the main Swiper (spotlightSwiper)
    const spotlightSwiper = new Swiper(spotlightContainerElement, {
        loop: true,
        init: false,
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
        },
      })
      .on("afterInit", function(swiper) {
        // Initialize nested Swipers (storySwipers) after the main Swiper is initialized
        initializeSpotlightStories(spotlightContainerElement);
        storySwipers[swiper.realIndex]?.el?.classList.add("spotlight-slide-visited");
      })
      .on("slideChangeTransitionEnd", function(swiper) {
        // Start and resume autoplay for the current nested Swiper
        storySwipers[swiper.realIndex]?.autoplay?.start();
        storySwipers[swiper.realIndex]?.autoplay?.resume();
        
        // Mark the current slide as visited
        storySwipers[swiper.realIndex]?.el?.classList.add("spotlight-slide-visited");
      })
      .on("slideChangeTransitionStart", function(swiper) {
        // Stop autoplay for both previous and current nested Swipers
        storySwipers[swiper.previousRealIndex]?.autoplay?.stop();
        storySwipers[swiper.realIndex]?.autoplay?.stop();
      });

    // Initialize the main Swiper
    spotlightSwiper.init();

    // Function to initialize nested Swipers (storySwipers)
    function initializeSpotlightStories(spotlightContainer) {
      [
        ...spotlightContainer.getElementsByClassName("spotlight-slide"),
      ].forEach((spotlightSlide) => {
        const realSlideIndex = spotlightSlide.getAttribute("data-swiper-slide-index");

        // Initialize nested Swiper (storySwiper)
        storySwipers[realSlideIndex] = new Swiper(
            spotlightSlide.querySelector(".story-container"), {
              loop: true,
              init: false,
              autoplay: {
                delay: autoplayDelay,
                disableOnInteraction: false,
                waitForTransition: true,
              },
              slidesPerView: 1,
              pagination: {
                el: ".swiper-pagination",
                type: "bullets",
              },
              navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
              },
            }
          )
          .on("afterInit", function(swiper) {
            // Stop autoplay for all nested Swipers except the first one
            realSlideIndex != 0 && swiper.autoplay.stop();
          })
          .on("slideNextTransitionStart", function(swiper) {
            // Move to the next slide in the main Swiper when the last slide of the nested Swiper is reached
            if (swiper.realIndex === 0) {
              spotlightSwiper.slideNext();
            }
          })
          .on("slidePrevTransitionStart", function(swiper) {
            // Move to the previous slide in the main Swiper when the first slide of the nested Swiper is reached
            if (swiper.realIndex === swiper.slides.length - 1) {
              spotlightSwiper.slidePrev();
            }
          })
          .on("autoplayTimeLeft", function(swiper, timeLeft, progress) {
            // Update the story progress using a CSS variable
            document.body.style.setProperty(
              "--story-progress",
              isNaN(progress) ? 0 : progress.toFixed(3)
            );
          });

        // Initialize the nested Swiper
        storySwipers[realSlideIndex].init();
      });
    }
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
