// Fetch data from JSON file
fetch("./data.json")
  .then((data) => data.json())
  .then((data) => {
    const storySwipers = [], autoplayDelay = 3000;
    const spotlightSliderElement = document.querySelector(".spotlight-slider");
    const spotlightContainerElement = document.querySelector(".spotlight-container");
    const spotlightContainerPopupElement = document.querySelector(".spotlight-container").parentElement;
    spotlightSliderElement.innerHTML = generateSpotlightSliderHtml(data);
    spotlightContainerElement.innerHTML = generateSpotlightContainerHtml(data);

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
      .on("slideChange", function(swiper) {
        if(!storySwipers[swiper.realIndex]) return;

        // Start and resume autoplay for the current nested Swiper
        storySwipers[swiper.realIndex].autoplay.start();
        storySwipers[swiper.realIndex].autoplay.resume();
        storySwipers[swiper.realIndex].keyboard.enabled = true;
        
        // Mark the current slide as visited
        storySwipers[swiper.realIndex].el.classList.add("spotlight-slide-visited");
      })
      .on("beforeSlideChangeStart", function(swiper) {
        const previousSlide = storySwipers[swiper.previousRealIndex ?? swiper.previousIndex];
        if(previousSlide) {
          // Stop autoplay for both previous and current nested Swipers
          previousSlide.autoplay.stop();
          previousSlide.keyboard.enabled = false;
        }
        storySwipers[swiper.realIndex]?.autoplay?.stop();
      });

    new Swiper(spotlightSliderElement, {
      loop: false,
      autoplay: false,
      slidesPerView: 2.5,
      spaceBetween: 30,
      breakpoints: {
        768: {
          slidesPerView: 4.5,
        },
        1366: {
          slidesPerView: 6.5,
        },
      },
    }).on('click', function(swiper) {
      // Initialize the main Swiper
      spotlightContainerPopupElement.classList.add("active");
      if(!spotlightSwiper.initialized) {
        spotlightSwiper.init();
      }
      spotlightSwiper.slideToLoop(swiper.clickedIndex);
      storySwipers[swiper.clickedIndex]?.autoplay?.resume();
    });

    // Function to initialize nested Swipers (storySwipers)
    function initializeSpotlightStories(spotlightContainer) {
      [
        ...spotlightContainer.getElementsByClassName("spotlight-slide"),
      ].forEach((spotlightSlide, index) => {
        const realSlideIndex = spotlightSlide.getAttribute("data-swiper-slide-index") ?? index;

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
              if(!spotlightSwiper.loopedSlides && spotlightSwiper.realIndex === spotlightSwiper.slides.length - 1) {
                spotlightContainerPopupElement.classList.remove("active")
                storySwipers[swiper.realIndex]?.autoplay?.stop();
              } else {
                spotlightSwiper.slideNext();
              }
            }
          })
          .on("slidePrevTransitionStart", function(swiper) {
            // Move to the previous slide in the main Swiper when the first slide of the nested Swiper is reached
            if (swiper.realIndex === swiper.slides.length - 1) {
              spotlightSwiper.slidePrev();
            }
          })
          .on("autoplayTimeLeft", function(_, timeLeft, progress) {
            // Update the story progress using a CSS variable
            console.log(timeLeft)
            document.body.style.setProperty(
              "--story-progress",
              isNaN(progress) || progress < 0 ? 1 : 1 - progress.toFixed(3)
            );

            // if(swiper.slides.length === 1 && progress.toFixed(2) < 0) {
            //   spotlightSwiper.slideNext();
            //   swiper.autoplay.stop();
            // }
          });

        // Initialize the nested Swiper
        storySwipers[realSlideIndex].init();
      });
    }

    // Handle popup close
    spotlightContainerPopupElement.querySelector(".close").addEventListener("click", () => {
      spotlightContainerPopupElement.classList.remove("active")
      storySwipers[spotlightSwiper.realIndex]?.autoplay?.stop();
    });
  });

// Function to generate HTML from JSON data
function generateSpotlightSliderHtml(data) {
  let spotlightSliderHtml = '<div class="swiper-wrapper">';

  data?.stories?.forEach(storyBlock => {
    spotlightSliderHtml += `<div class="swiper-slide spotlight-slide">
      <div class="spotlight-card">
        <div class="image"><img src="${storyBlock.image}" alt="" /></div>
        <div class="title">${storyBlock.name}</div>
      </div>
    </div>`;
  });

  spotlightSliderHtml += `</div>`;

  return spotlightSliderHtml;
}

// Function to generate HTML from JSON data
function generateSpotlightContainerHtml(data) {
  let spotlightContainerHtml = '<div class="swiper-wrapper">';

  data?.stories?.forEach(storyBlock => {
    spotlightContainerHtml += `<div class="swiper-slide spotlight-slide">
      <div class="title">${storyBlock.name}</div>
      <div class="story-container">
        <div class="swiper-wrapper">`;

    storyBlock.cards.forEach((card) => {
      spotlightContainerHtml += `<div class="swiper-slide">
          <div class="story-card">
            <div class="card-image">
              <img src="${card.imageSrc}" alt="" />
            </div>
            <div class="card-body">
              <h3 class="card-title">${card.cardTitle}</h3>`;

      if (card.description) {
        spotlightContainerHtml += `<p class="description">${card.description}</p>`;
      }

      spotlightContainerHtml += `</div>
          </div>
        </div>`;
    });

    spotlightContainerHtml += `</div>
        <div class="swiper-pagination"></div>
        <div class="swiper-button-prev"></div>
        <div class="swiper-button-next"></div>
      </div>
    </div>`;
  });

  spotlightContainerHtml += `</div>`;

  return spotlightContainerHtml;
}
