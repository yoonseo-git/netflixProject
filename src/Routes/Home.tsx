import { useQuery } from "react-query";
import { IGetMoviesResult, getMovies, getTopMv, getUpcomingMv } from "../api";
import styled from "styled-components";
import { makeImagePath } from "../utils";
import { motion, AnimatePresence, useViewportScroll } from "framer-motion";
import { useState } from "react";
import { useNavigate, useMatch, useParams } from "react-router-dom";
import { relative } from "path";

const Wrapper = styled.div``;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Banner = styled.div<{ bgPhoto: string }>`
  height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  background-image: linear-gradient(
      rgba(0, 0, 0, 0),
      ${(props) => props.theme.black.veryDark}
    ),
    url(${(props) => props.bgPhoto});
  background-size: cover; /* Î∞∞Í≤Ω ?¥Î?ÏßÄÎ•??îÏÜå??ÎßûÍ≤å Ï∂ïÏÜå */
`;

const Title = styled.h2`
  font-size: 68px;
  margin-bottom: 20px;
`;

const Overview = styled.p`
  font-size: 32px;
  width: 50%;
  line-height: 40px;
`;

const BannerInfo = styled(motion.div)`
  cursor: pointer;
  background-color: rgba(178, 190, 195, 0.4);
  width: 180px;
  font-size: 32px;
  padding: 10px;
  border-radius: 15px;
  margin-top: 30px;
  color: white;
`;

const BannerInfoVariants = {
  hover: {
    scale: 0.95,
    backgroundColor: "rgba(178, 190, 195, 0.3)",
    color: "#e1e2e2c0",
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.3)",
    transition: { duration: 0.3, type: "spring" },
  },
};

const Slider = styled.div`
  position: relative;
  top: -100px;
  margin-bottom: 250px;
`;

const Subject = styled(motion.span)`
  cursor: pointer;
  color: ${(props) => props.theme.white.darker};
  padding: 10px;
  font-size: 34px;
  font-weight: 400;
  transition: color 0.3s ease-in-out;
  &:hover {
    color: ${(props) => props.theme.white.lighter};
  }
`;

const Row = styled(motion.div)`
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(6, 1fr);
  position: absolute;
  width: 100%;
  margin-top: 10px;
`;

const Box = styled(motion.div)<{ bgPhoto?: string }>`
  display: flex;
  align-items: center;
  border-radius: 15px;
  background-image: url(${(props) => props.bgPhoto});
  background-size: cover;
  background-position: center;
  height: 200px;
  font-size: 66px;
  overflow: hidden;
  cursor: pointer;
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
`;

const RightArrow = styled(motion.svg)`
  fill: white;
  position: relative;
  width: 40px;
  top: 75px;
`;

const RightArrowOverlay = styled(motion.div)`
  padding-left: 10px;
  position: absolute;
  width: 50px;
  height: 200px;
  background-color: rgba(0, 0, 0, 0.5);
  right: 0;
  top: 51px;
`;

const LeftArrow = styled(motion.svg)`
  fill: white;
  position: relative;
  width: 40px;
  top: 75px;
`;

const LeftArrowOverlay = styled(motion.div)`
  position: absolute;
  width: 50px;
  height: 200px;
  background-color: rgba(0, 0, 0, 0.5);
  top: 51px;
`;

const ArrowVariants = {
  normal: { opacity: 0 },
  hover: { opacity: 1, transition: { duration: 0.6 } },
};

const boxVariants = {
  normal: {
    scale: 1,
  },
  hover: {
    scale: 1.3,
    y: -50,
    transition: {
      delay: 0.3,
      type: "tween",
    },
  },
};

const Info = styled(motion.div)`
  padding: 10px;
  background-color: ${(props) => props.theme.black.lighter};
  opacity: 0;
  position: absolute;
  width: 100%;
  bottom: 0;
  h4 {
    text-align: center;
    font-size: 16px;
  }
`;

const Rank = styled(motion.div)`
  flex: 2; /* ?àÎ∞ò ?¨Í∏∞ ?§Ï†ï */
  height: 76%;
  text-align: center;
  font-weight: bold;
  font-size: 100px;
  color: gray;
  text-shadow: -1px -1.5px 0 white;
`;

const Image = styled.div`
  flex: 8;
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
`;

const BigMovie = styled(motion.div)`
  position: absolute;
  width: 40vw;
  height: auto;
  left: 0;
  right: 0;
  margin: 0 auto;
  border-radius: 15px;
  overflow: hidden;
  background-color: ${(props) => props.theme.black.veryDark};
`;

const CheckDiv = styled(motion.div)`
  position: relative;
  top: -90px;
  padding-left: 30px;
`;

const CheckBox = styled(motion.span)`
  position: relative;
  top: 10px;
  margin-right: 10px;
  span {
    display: none;
    top: -5px;
  }
`;

const LikeBtn = styled(motion.svg)`
  cursor: pointer;
  margin-right: 10px;
  width: 35px;
  height: 35px;
  stroke: whitesmoke;
  stroke-width: 20px;
  position: relative;
  top: 10px;
  transition: fill 0.5s ease;

  &:hover + span {
    display: inline-block; // hover ?ÅÌÉú?êÏÑú ?çÏä§???úÏãú
    font-weight: bold;
    letter-spacing: 1px;
    color: whitesmoke;
  }
`;

const HateBtn = styled(motion.svg)`
  cursor: pointer;
  margin-right: 10px;
  margin-left: 10px;
  width: 35px;
  height: 35px;
  stroke: whitesmoke;
  stroke-width: 20px;
  position: relative;
  top: 10px;
  transition: fill 0.5s ease;

  &:hover + span {
    display: inline-block; // hover ?ÅÌÉú?êÏÑú ?çÏä§???úÏãú
    font-weight: bold;
    letter-spacing: 1px;
    color: whitesmoke;
  }
`;

const BtnVariants = {
  normal: { fill: "transparent" },
  hover: {
    fill: "whitesmoke",
  },
};

const BigDate = styled.p`
  margin-left: 500px;
  font-size: 20px;
  font-weight: 200px;
  color: ${(props) => props.theme.white.lighter};
  position: relative;
  top: -20px;
`;

const BigAvg = styled.p`
  position: relative;
  margin-left: 500px;
  font-size: 20px;
  font-weight: 200px;
`;

const BigCover = styled.div<{ bgPhoto: string }>`
  width: 100%;
  background-size: cover;
  background-position: center center;
  height: 430px;
  background-image: linear-gradient(to top, black, transparent),
    url(${(props) => props.bgPhoto});
`;

const BigTitle = styled.h2`
  color: ${(props) => props.theme.white.lighter};
  padding: 20px;
  font-size: 46px;
  font-weight: bold;
  position: relative;
  top: -90px;
`;

const BigOverview = styled.p`
  line-height: 30px;
  padding: 10px;
  font-size: 20px;
  top: -75px;
  position: relative;
  color: ${(props) => props.theme.white.lighter};
`;

const rowVariants = {
  hidden: (back: boolean) => ({
    x: back ? -window.outerWidth - 5 : window.outerWidth + 5,
  }),
  visible: {
    x: 0,
  },
  exit: (back: boolean) => ({
    x: back ? window.outerWidth + 5 : -window.outerWidth - 5,
  }),
};

const infoVariants = {
  hover: {
    opacity: 1,
    transition: {
      delay: 0.3,
      type: "tween",
    },
  },
};

const offset = 6;

function Home() {
  const navigate = useNavigate();
  const { movieId } = useParams();
  const bigMovieMatch = useMatch("/movies/:movieId");
  const { scrollY } = useViewportScroll();

  const { data, isLoading } = useQuery<IGetMoviesResult>(
    ["movies", "nowPlaying"],
    getMovies
  );

  const { data: upcoming } = useQuery<IGetMoviesResult>(
    ["movies", "upcoming"],
    getUpcomingMv
  );

  const { data: toprated } = useQuery<IGetMoviesResult>(
    ["movies", "toprated"],
    getTopMv
  );

  const [index, setIndex] = useState(0);
  const [index_upcoming, setIndex_upcoming] = useState(0);
  const [index_toprated, setIndex_toprated] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [back, setBack] = useState(false);

  const increaseIndex = () => {
    if (data) {
      if (leaving) return;
      toggleLeaving();
      setBack(true);
      const totalMovies = data?.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const decreaseIndex = () => {
    if (data) {
      if (leaving) return;
      toggleLeaving();
      setBack(false);
      const totalMovies = data?.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
    }
  };

  const increaseIndex_upcoming = () => {
    if (upcoming) {
      if (leaving) return;
      toggleLeaving();
      setBack(true);
      const totalMovies = upcoming?.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setIndex_upcoming((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const decreaseIndex_upcoming = () => {
    if (upcoming) {
      if (leaving) return;
      toggleLeaving();
      setBack(false);
      const totalMovies = upcoming?.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setIndex_upcoming((prev) => (prev === 0 ? maxIndex : prev - 1));
    }
  };

  const increaseIndex_toprated = () => {
    if (upcoming) {
      if (leaving) return;
      toggleLeaving();
      setBack(true);
      const totalMovies = upcoming?.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setIndex_toprated((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const decreaseIndex_toprated = () => {
    if (upcoming) {
      if (leaving) return;
      toggleLeaving();
      setBack(false);
      const totalMovies = upcoming?.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setIndex_toprated((prev) => (prev === 0 ? maxIndex : prev - 1));
    }
  };

  const toggleLeaving = () => setLeaving((prev) => !prev);
  const onBoxClicked = (movieId: number) => {
    navigate(`/movies/${movieId}`);
  };

  const onOverlayClick = () => navigate("/");
  const clickedMovie = bigMovieMatch?.params.movieId
    ? data?.results.find(
        (movie) => String(movie.id) === bigMovieMatch.params.movieId
      ) ||
      upcoming?.results.find(
        (upcomigMv) => String(upcomigMv.id) === bigMovieMatch.params.movieId
      ) ||
      toprated?.results.find(
        (topMv) => String(topMv.id) === bigMovieMatch.params.movieId
      )
    : null;

  return (
    <Wrapper>
      {isLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner
            bgPhoto={makeImagePath(data?.results[19].backdrop_path || "")}
          >
            <Title>{data?.results[19].title}</Title>
            {/* <Overview>{data?.results[0].overview}</Overview> */}
            <BannerInfo
              onClick={() => {
                onBoxClicked(Number(data?.results[19].id));
              }}
              variants={BannerInfoVariants}
              whileHover="hover"
            >
              Movie Info
            </BannerInfo>
          </Banner>

          {/* top-rated Slider */}
          <Slider style={{ marginTop: 100 }}>
            <AnimatePresence
              initial={false}
              custom={back}
              onExitComplete={toggleLeaving}
            >
              <Subject>Most Popular Movies</Subject>
              <Row
                custom={back}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={index_toprated}
              >
                {toprated?.results
                  .slice(
                    offset * index_toprated,
                    offset * index_toprated + offset
                  )
                  .map((topMv, rank) => (
                    <Box
                      key={topMv.id}
                      whileHover="hover"
                      initial="normal"
                      variants={boxVariants}
                      transition={{ type: "tween" }}
                      onClick={() => onBoxClicked(topMv.id)}
                    >
                      <Rank>{offset * index_toprated + rank + 1}</Rank>
                      <Image>
                        <img
                          src={makeImagePath(topMv.backdrop_path)}
                          alt={topMv.title}
                          style={{
                            width: "100%",
                            height: "auto",
                            backgroundImage: "cover",
                          }}
                        ></img>
                      </Image>
                      <Info variants={infoVariants}>
                        <h4>{topMv.title}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
            <LeftArrowOverlay
              onClick={decreaseIndex_toprated}
              variants={ArrowVariants}
              initial="normal"
              whileHover="hover"
              style={{ height: 140, top: 75 }}
            >
              <LeftArrow
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
              </LeftArrow>
            </LeftArrowOverlay>

            <RightArrowOverlay
              onClick={increaseIndex_toprated}
              variants={ArrowVariants}
              initial="normal"
              whileHover="hover"
              style={{ height: 140, top: 75 }}
            >
              <RightArrow
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
              </RightArrow>
            </RightArrowOverlay>
          </Slider>

          {/* Nowplaying Slider */}
          <Slider>
            <AnimatePresence
              custom={back}
              initial={false}
              onExitComplete={toggleLeaving}
            >
              <Subject>Now Playing</Subject>
              <Row
                variants={rowVariants}
                custom={back}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={index}
              >
                {data?.results
                  .slice(1)
                  .slice(offset * index, offset * index + offset)
                  .map((movie) => (
                    <Box
                      layoutId={movie.id + ""}
                      key={movie.id}
                      whileHover="hover"
                      initial="normal"
                      variants={boxVariants}
                      onClick={() => {
                        onBoxClicked(movie.id);
                      }}
                      transition={{ type: "tween" }}
                      bgPhoto={makeImagePath(movie.backdrop_path)}
                    >
                      <Info variants={infoVariants}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
            <LeftArrowOverlay
              onClick={decreaseIndex}
              variants={ArrowVariants}
              initial="normal"
              whileHover="hover"
            >
              <LeftArrow
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
              </LeftArrow>
            </LeftArrowOverlay>

            <RightArrowOverlay
              onClick={increaseIndex}
              variants={ArrowVariants}
              initial="normal"
              whileHover="hover"
            >
              <RightArrow
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
              </RightArrow>
            </RightArrowOverlay>
          </Slider>

          {/* Upcoming Slider */}
          <Slider>
            <AnimatePresence
              initial={false}
              custom={back}
              onExitComplete={toggleLeaving}
            >
              <Subject>Upcoming!!</Subject>
              <Row
                custom={back}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={index_upcoming}
              >
                {upcoming?.results
                  .slice(
                    offset * index_upcoming,
                    offset * index_upcoming + offset
                  )
                  .map((comingMv) => (
                    <Box
                      key={comingMv.id}
                      whileHover="hover"
                      initial="normal"
                      variants={boxVariants}
                      transition={{ type: "tween" }}
                      onClick={() => onBoxClicked(comingMv.id)}
                      bgPhoto={makeImagePath(comingMv.backdrop_path)}
                    >
                      <Info variants={infoVariants}>
                        <h4>{comingMv.title}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
            <LeftArrowOverlay
              onClick={decreaseIndex_upcoming}
              variants={ArrowVariants}
              initial="normal"
              whileHover="hover"
            >
              <LeftArrow
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
              </LeftArrow>
            </LeftArrowOverlay>

            <RightArrowOverlay
              onClick={increaseIndex_upcoming}
              variants={ArrowVariants}
              initial="normal"
              whileHover="hover"
            >
              <RightArrow
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
              </RightArrow>
            </RightArrowOverlay>
          </Slider>

          {/* Detail movie popup box */}
          <AnimatePresence>
            {bigMovieMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClick}
                  exit={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
                <BigMovie
                  style={{ top: scrollY.get() + 70 }}
                  layoutId={movieId} // movieId(useParam?êÏÑú Í∞Ä?∏Ïò® id)
                >
                  {clickedMovie && (
                    <>
                      <BigCover
                        bgPhoto={makeImagePath(clickedMovie.backdrop_path)}
                      />
                      <BigTitle>{clickedMovie.title}</BigTitle>
                      <CheckDiv>
                        <motion.span
                          style={{
                            position: "relative",
                            background: "rgba(45, 52, 54,0.3)",
                            borderRadius: 40,
                            padding: 15,
                            paddingBottom: 35,
                            paddingLeft: 30,
                            top: 10,
                          }}
                        >
                          <CheckBox>
                            <LikeBtn
                              variants={BtnVariants}
                              initial="normal"
                              whileHover="hover"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 512 512"
                            >
                              <path d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2H464c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48H294.5c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3V320 272 247.1c0-29.2 13.3-56.7 36-75l7.4-5.9c26.5-21.2 44.6-51 51.2-84.2l2.3-11.4c5.2-26 30.5-42.9 56.5-37.7zM32 192H96c17.7 0 32 14.3 32 32V448c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32V224c0-17.7 14.3-32 32-32z" />
                            </LikeBtn>
                            <span>Good??</span>
                          </CheckBox>

                          <CheckBox>
                            <HateBtn
                              variants={BtnVariants}
                              initial="normal"
                              whileHover="hover"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 512 512"
                            >
                              <path d="M313.4 479.1c26-5.2 42.9-30.5 37.7-56.5l-2.3-11.4c-5.3-26.7-15.1-52.1-28.8-75.2H464c26.5 0 48-21.5 48-48c0-18.5-10.5-34.6-25.9-42.6C497 236.6 504 223.1 504 208c0-23.4-16.8-42.9-38.9-47.1c4.4-7.3 6.9-15.8 6.9-24.9c0-21.3-13.9-39.4-33.1-45.6c.7-3.3 1.1-6.8 1.1-10.4c0-26.5-21.5-48-48-48H294.5c-19 0-37.5 5.6-53.3 16.1L202.7 73.8C176 91.6 160 121.6 160 153.7V192v48 24.9c0 29.2 13.3 56.7 36 75l7.4 5.9c26.5 21.2 44.6 51 51.2 84.2l2.3 11.4c5.2 26 30.5 42.9 56.5 37.7zM32 384H96c17.7 0 32-14.3 32-32V128c0-17.7-14.3-32-32-32H32C14.3 96 0 110.3 0 128V352c0 17.7 14.3 32 32 32z" />
                            </HateBtn>
                            <span>Bad?ò•</span>
                          </CheckBox>
                        </motion.span>

                        <BigDate>
                          <span style={{ color: "gray" }}>Í∞úÎ¥â??: </span>
                          {clickedMovie.release_date}
                        </BigDate>
                        <BigAvg>
                          <span style={{ color: "gray" }}>?ÅÌôî?âÏ†ê : </span>{" "}
                          <span style={{ color: "red" }}>??</span>
                          {clickedMovie.vote_average
                            ? clickedMovie.vote_average.toFixed(2)
                            : "-"}
                        </BigAvg>
                      </CheckDiv>
                      <BigOverview>
                        {clickedMovie.overview
                          ? clickedMovie.overview
                          : "No OverView."}
                      </BigOverview>
                    </>
                  )}
                </BigMovie>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}

export default Home;
