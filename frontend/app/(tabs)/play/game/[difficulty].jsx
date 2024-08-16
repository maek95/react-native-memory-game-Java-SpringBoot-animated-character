import { FontAwesome } from "@expo/vector-icons";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { Context } from "../../../../context";
import { Path, Svg } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { Shadow } from "react-native-shadow-2";
import { host } from "../../../utils";
import { AuthContext } from "../../../../AuthContext";

export default function GameDetail() {
  const characterPosition = useRef(
    new Animated.ValueXY({ x: 0, y: 0 }) // character starts in top left corner
  ).current; // current: set to the initialValue passed... animated xy...
  const [characterIsMoving, setCharacterIsMoving] = useState(false);

  const [gameIsStarted, setGameIsStarted] = useState(false);
  const [pattern, setPattern] = useState([]);
  const [sequenceComplete, setSequenceComplete] = useState(false);
  const [pressedSlice, setPressedSlice] = useState(null); // State for tracking pressed slice
  const { count, setCount } = useContext(Context);
  const local = useLocalSearchParams();
  const [animatedColor, setAnimatedColor] = useState("purple");
  const [clickCount, setClickCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timerReady, setTimerReady] = useState(true);
  const [isWinner, setIsWinner] = useState(false);
  const [wrongClickCount, setWrongClickCount] = useState(0);
  const [messagePostHighscore, setMessagePostHighscore] = useState("");
  //const [IsNewHighscore, setIsNewHighscore] = useState(false);
  const [newHighscoreTitle, setNewHighscoreTitle] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [timerColor, setTimerColor] = useState("white");
  const [temporaryDisabledButton, setTemporaryDisabledButton] = useState(true);
  const [sliceBaseColor, setSliceBaseColor] = useState("white");
  const [activeSlice, setActiveSlice] = useState(null); // setActiveSlice function to make sure we do not randomize the same slice two times in a row...we do not directly use activeSlice for anything else.

  const { currentUsername } = useContext(AuthContext);

  const router = useRouter();

  const animatedOpacities = [];
  for (let i = 0; i < 4; i++) {
    animatedOpacities.push(useRef(new Animated.Value(0)).current);
  }

  if (!local.sequenceLength) {
    return (
      <View style={styles.container}>
        <Text>Loading difficulty...</Text>{" "}
        {/* probably unnecessary since sequenceLength is just a prop, nothing async? */}
      </View>
    );
  }
  const sequenceLength = local.sequenceLength;
  const timerOfDifficulty = Math.floor(sequenceLength * 1.5).toFixed(1); // Math.floor makes it into an integer (cuts off the decimal) and then we add one decimal again (.0) using toFixed(1).
  //const timerOfDifficulty = parseFloat((sequenceLength * 1.8).toFixed(1));
  //const [timer, setTimer] = useState((8.0).toFixed(1)); 
  const [timer, setTimer] = useState(timerOfDifficulty); 

  function resetStates() {
    characterPosition.setValue({ x: 0, y: 0 }); // top left corner
    setActiveSlice(null);
    setCharacterIsMoving(false);
    setIsWinner(false); // Reset winner status
    setCorrectCount(0); // Reset correct count
    setWrongClickCount(0); // Reset wrong click count
    setAnimatedColor("purple"); // Reset animated color
    setPattern([]); // Reset pattern
    setClickCount(0); // Reset click count
    setPressedSlice(null); // Reset pressed slice
    setSequenceComplete(false); // Reset sequence complete
    //setTimer((8.0).toFixed(1)); // Reset timer... 
    setTimer(timerOfDifficulty); // Reset timer... 
    setTimerReady(true); // Reset timer readiness
    setShowResult(false);
    setTemporaryDisabledButton(true);
    setSliceBaseColor("white");
    setNewHighscoreTitle("");

    animatedOpacities.forEach((animatedOpacity) => animatedOpacity.setValue(0)); // Reset animated values, otherwise some animation linger into next game
  }

  // TODO: time penalty if click wrong slice, how update the timer that is already running?
  useEffect(() => {
    if (sequenceComplete && timerReady) {
      const timerInterval = setInterval(() => {
        setTimer((prevTimer) => {
          const newTime = Math.max(prevTimer - 0.1, 0).toFixed(1); // newTime variable so we can keep track of the actual timer and trigger the if-statement below
          if (newTime == 0) {
            setGameIsStarted(false); // turns false when time reaches 0, i.e. time is up.
            setShowResult(true); // Show result when timer reaches 0
          }
          return newTime;
        });
      }, 100);

      return () => clearInterval(timerInterval);
    }
  }, [sequenceComplete, timerReady]);

  // if we want it to tick down faster when clicking wrong
  /*  useEffect(() => {
    if (wrongClickCount > 0) {
      setTimer((prevTimer) => {
        const newTime = Math.max(prevTimer - 0.8, 0).toFixed(1); // - 0.8 instead of - 0.1
        if (newTime == 0) { 
          setGameIsStarted(false); // turns false when time reaches 0, i.e. time is up.
          setShowResult(true); // Show result when timer reaches 0
        }
        return newTime;
      });
    }
  }, [wrongClickCount]) */

  useEffect(() => {
    if (wrongClickCount > 0) {
      setTimerColor("red");

      setTimeout(() => {
        setTimerColor("white");
      }, 300);

      // Cleanup function to clear the timeout if the component unmounts
      return () => clearTimeout(timer);
    }
  }, [wrongClickCount]);

  useEffect(() => {
    if (correctCount == sequenceLength && !characterIsMoving) {
      setTimerReady(false); // Stop the timer when all sequences are correct
      setIsWinner(true);
      setGameIsStarted(false); // game has ended if user clicked on all correct slices!
      setShowResult(true);
    } /* else if (timer === 0) { // placed this logic inside the useEffect above instead
      setShowResult(true);
    } */
  }, [correctCount, sequenceLength, characterIsMoving]); // could have 'timer' here but it would cause re-render every 0.1 seconds then? maybe bad?

  useEffect(() => {
    if (showResult) {
      setTimeout(() => {
        setTemporaryDisabledButton(false);
      }, 700); // after 700ms the user can click Play Again, to avoid accidental click when it appears suddenly
    }

    setSliceBaseColor("teal");
  }, [showResult]);

  /* const animatedOpacity1 = useRef(new Animated.Value(0)).current;
  const animatedOpacity2 = useRef(new Animated.Value(0)).current;
  const animatedOpacity3 = useRef(new Animated.Value(0)).current;
  const animatedOpacity4 = useRef(new Animated.Value(0)).current; */

  // update highscore only if perfected difficulty, the endpoint will also check if this difficulty has already been completed.
  useEffect(() => {
    if (isWinner && wrongClickCount == 0) {
      postUpdateHighscore();
    }
  }, [isWinner]);

  

  // move character to a specific slice
  function moveToSlice(targetX, targetY, slice) {
    // character needs to "run" there a set speed
    const characterSpeed = 400; // character moves at 400px per second

    // need to do this, otherwise position x and y arent treated as numbers...
    const currentPos = characterPosition.__getValue();
    const distanceX = currentPos.x - targetX;
    const distanceY = currentPos.y - targetY;

    // Euclidean distance formula, which calculates the straight-line distance between two points in a 2D plane.
    // distance in pixels
    const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));

    const timeToDestination = (distance / characterSpeed) * 1000; // converted to milliseconds for Animated duration
    /* console.log(
      "Distance:",
      distance,
      "Time to Destination (ms):",
      timeToDestination
    ); */

    setCharacterIsMoving(true);
    Animated.timing(characterPosition, {
      toValue: { x: targetX, y: targetY },
      duration: timeToDestination, // Speed of movement
      useNativeDriver: false, // need to set useNativeDriver to false because position-related properties aren't supported by the native driver.
      // if left true the animation would either not work as expected or simply not run at all..?
    }).start(({ finished }) => {
      // finished becomes a boolean automatically which tracks if the animation is finished or not.
      if (finished) {
        // this was all in handlePress before, now we wait for the character to be finished moving before animating!

        /* console.log("slice: ", slice); */

        // TODO: movetoslice here

        if (slice === pattern[clickCount]) {
          console.log("correct!");
          /*  setActiveSlice(slice); */
          setCorrectCount((prevCorrectCount) => prevCorrectCount + 1);
          setAnimatedColor("green");
        } else {
          console.log("wrong!");
          setWrongClickCount((prevClickCount) => prevClickCount + 1);
          setClickCount((prevClickCount) => prevClickCount - 1); // e.g. if the first slice is 1 and you click 2, you still have to click 1 to get "correct" until you can guess the next slice in the pattern

          // PENALTY IF CLICKING WRONG:
          setTimer((prevTimer) => Math.max(prevTimer - 1.0, 0).toFixed(1)); // Directly decrease the timer by 1 second

          setAnimatedColor("red");
        }

        const animatedOpacity = animatedOpacities[slice - 1]; // slice  of the circle
        animatedOpacity.setValue(1); // no longer invisible
        Animated.timing(animatedOpacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start();

        console.log("Finished moving character");
        setCharacterIsMoving(false); // currently only used on the last move before the user wins the game, so we have time to see the character move before declaring a win. This is because the "correct slice" is determined on-click and not on character arriving there.
        // TODO: time penalty should also wait for characterIsMoving to be false!
      }
    });
  }

   const handlePress = (event) => {
    if (sequenceComplete && clickCount < sequenceLength && !characterIsMoving) {
      const { locationX, locationY } = event.nativeEvent;
      const centerX = 150; // Half of the SVG height and width (300/2)
      const centerY = 150; // Half of the SVG height and width (300/2)
      const dx = locationX - centerX;
      const dy = locationY - centerY;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 180;

      let slice = 0;
      if (angle >= 0 && angle < 90) {
        slice = 4;
      } else if (angle >= 90 && angle < 180) {
        slice = 1;
      } else if (angle >= 180 && angle < 270) {
        slice = 2;
      } else {
        slice = 3;
      }

      console.log(`Pressed slice: ${slice}`);
      setClickCount((prevClickCount) => prevClickCount + 1); // click count is in here so we always wait for the animation to be ready first

      console.log("pattern[clickCount]: ", pattern[clickCount]);

      moveToSlice(locationX, locationY, slice);
    } else if (!sequenceComplete) {
      console.log("Can't click before sequence is complete!");
    } else if (characterIsMoving) {
      console.log("Wait for character to stop moving before moving again!");
    } else {
      console.log("Game is finished, no more clicking!");
    }
  };

  function getRandomSlice(prevSlice) {
    let newSlice;

    // keep on looping until a slice is randomized that isnt the same as the previous one. Also works in the case of currentSlice being null (first one)
    do {
      newSlice = Math.floor(Math.random() * 4) + 1;
    } while (newSlice === prevSlice);

    // same thing as above:
    /*  while (newSlice == currentSlice) {
      newSlice = Math.floor(Math.random() * 4) + 1;
    } */

    //console.log("newSlice:", newSlice);
    //setActiveSlice(newSlice);

    return newSlice;
  }

  useEffect(() => {
    if (gameIsStarted) {
      console.log("sequence length: ", sequenceLength);

      let count = 0;

      resetStates(); // already done when pressing Play Again and when loading into page for the first time, but just making sure it is reset.

      const interval = setInterval(() => {
        if (count >= sequenceLength) {
          clearInterval(interval);
          setActiveSlice(null);
          setSequenceComplete(true);
          console.log("sequenceComplete: ", sequenceComplete);
          return;
        }

        // setActiveSlice keeps track of the slice returned from getRandomSlice so we do not get the same slice two times in a row. Needs to be wrapped like this to properly manage state updates.
        setActiveSlice((prevSlice) => {
          const slice = getRandomSlice(prevSlice);
          setPattern((prevPattern) => [...prevPattern, slice]); // save which slices blinked

          // Reset all animated opacities, if for some reason it wasnt already
          /*  animatedOpacity1.setValue(0);
          animatedOpacity2.setValue(0);
          animatedOpacity3.setValue(0);
          animatedOpacity4.setValue(0); */
          animatedOpacities.forEach((animatedOpacity) =>
            animatedOpacity.setValue(0)
          );

          // Animate the opacity of the active slice
          if (slice >= 1 && slice <= 4) {
            const animatedOpacity =
              animatedOpacities[slice - 1]; /* slice  of the circle */
            animatedOpacity.setValue(1);

            Animated.timing(animatedOpacity, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }).start();
          }

          return slice;
        });

        count++;
      }, 1300); // 1300 - animated duration will be the cooldown between the animations...?

      return () => clearInterval(interval);
    }
  }, [gameIsStarted]);

  /* if (sequenceComplete) {
    console.log(`Pressed slice: ${pressedSlice}`);
  } */

  // TODO: timer ticking down

  /*  console.log("pattern:" , pattern);
  console.log("clickCount: ", clickCount); */

  async function postUpdateHighscore() {
    // http://localhost:4000/currentHighscore to check current highscore
    try {
      const response = await fetch(`${host}:8080/updateHighscore`, {
        // not localhost when running from virtual device. 10.0.2.2 finds my computers localhost!
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titleDifficultyPerfected: local.title,
          sequenceLength: local.sequenceLength,
          username: currentUsername,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      //console.log(data);

      /* console.log("Full response data: ", data);

      // Check individual properties
      console.log("data.message: ", data.message);
      console.log("data.savedHighscore: ", data.savedHighscore); */

      if (data.message) {
        // removed && data.savedHighscore because it is null if user has already beaten the difficulty...
        //setMessagePostHighscore(data.message);

        console.log("postUpdateHighscore data.message: ", data.message);
        console.log("Saved highscore: ", data.savedHighscore);
        if (data.savedHighscore != null) {
          // null if no new highscore is saved
          //setIsNewHighscore(true);
          setNewHighscoreTitle(data.savedHighscore.title);
        }
      } else {
        console.log("No data.message in /updateHighscore response?");
      }
    } catch (error) {
      console.log("Failed fetching endpoint /updateHighscore");
    }
  }

  //console.log("activeSliceOuter:", activeSlice);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.3)"]}
        //  colors={['transparent', 'rgba(255,255,255,0.5)']} // måste flytta på github-ikonen isåfall
        locations={[0, 1]}
        style={styles.background}
      />
      {/* container is Teal, and we have a gradient here that has position absolute and is transparent.. */}
      {showResult && (
        // {(timer == 0 || correctCount == sequenceLength) && (

        // cant use offset because gameFinishedView "background" is the inherit LinearGradient... makes it harder...
        <Shadow distance={5} startColor={"#FFFFFF"}>
          <View style={styles.gameFinishedView}>
            {/*  <Text style={[{ color: "white" }, styles.gameFinishedText]}>Game Finished</Text> */}
            {isWinner ? ( // TODO: add text that says highscore wont be saved when not logged in ?
              wrongClickCount > 0 ? (
                <>
                  <Text style={[{ color: "white" }, styles.gameFinishedText]}>
                    Decent!
                  </Text>
                  <Text style={[{ color: "white" }, styles.wrongClicksText]}>
                    Wrong clicks: {wrongClickCount}
                  </Text>
                </>
              ) : newHighscoreTitle === "" ? ( // no wrong clicks but not a new highscore
                <Text style={[{ color: "white" }, styles.gameFinishedText]}>
                  Perfect!
                </Text>
              ) : ( // no wrong clicks, and is a new highscore
                <>
                  <Text style={[{ color: "white" }, styles.gameFinishedText]}>
                    Perfect!
                  </Text>
                  <Text style={[{ color: "white" }, styles.wrongClicksText]}>
                    New difficulty completed: {newHighscoreTitle}!
                  </Text>
                </>
              )
            ) : (
              <Text style={[{ color: "red" }, styles.gameFinishedText]}>
                You Lost!
              </Text>
            )}

            <TouchableOpacity
              onPress={() => {
                setGameIsStarted(false); // Change to true if we want the game to instantly start again rather than going to Start button again

                resetStates(); // removes gameFinishedView and shows the start screen again!
              }}
              disabled={temporaryDisabledButton}
              style={styles.playAgainButton}
            >
              <Text style={styles.playAgainButtonText}>Play Again</Text>
              <FontAwesome name="play" color={"teal"} size={24} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                router.back();
              }}
              disabled={temporaryDisabledButton}
              style={styles.newDiffButton}
            >
              <FontAwesome
                name="arrow-left"
                color={"teal"}
                size={16}
              ></FontAwesome>
              <Text style={styles.newDiffButtonText}>New Difficulty</Text>
            </TouchableOpacity>
          </View>
        </Shadow>
      )}
      {!showResult &&
        (gameIsStarted ? (
          <View
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              gap: 36,
            }}
          >
            <View style={{ height: 80, width: "80%" }}>
              {!showResult &&
                (sequenceComplete ? (
                  <Text style={styles.instructionsMessage}>
                    Click to Move!
                    {/*  pressed slice: {pressedSlice} */}
                  </Text>
                ) : (
                  <Text style={styles.instructionsMessage}>
                    Remember the pattern!
                  </Text>
                ))}
            </View>

            <View style={styles.gameContainer}>
              <Animated.View
                style={[
                  characterPosition.getLayout(), // converts {x, y} into {left, top} for use in style
                  styles.characterContainer,
                ]}
              >
                <Text style={styles.character}>👾</Text>
                {!sequenceComplete && ( // "Hi!" before the player can move...
                  <Text
                    style={{
                      position: "absolute",
                      left: 0,
                      bottom: 0,
                      top: 0,
                      marginLeft: -32,
                      color: "white",
                      fontFamily: "SourceCodePro-Regular",
                    }}
                  >
                    {/* TODO: align with character without using marginLeft.. */}
                    Hi!
                  </Text>
                )}
              </Animated.View>

              <Shadow
                startColor="#ADD8E6" // lightblue
                //startColor="#008080" // Teal, so does nothing. Easier to remove/add shadow until ive decided
                style={{ borderRadius: 150 }}
              >
                <Svg
                  onPressIn={handlePress}
                  height="300"
                  width="300"
                  viewBox="0 0 100 100"
                  style={{ borderWidth: 0 }}
                >
                  {/* First slice */}
                  {/* <Path d="M50 50 L50 1 A49 49 0 0 1 99 50 Z" fill={"lightblue"} />  THIS SETS A "BORDER" AROUND THE SLICE'S EDGE*/}

                  {/* TODO: REMOVE GAMEFINISHEDVIEW, MAKE THE CIRCLE TEAL WITH A WHITE SHADOW AROUND, AND HAVE "PLAY AGAIN >" IN THERE! And "YOU LOST!" at instructionMessage!! */}
                  <Path
                    d="M50 50 L50 0 A50 50 0 0 1 100 50 Z"
                    fill={sliceBaseColor}
                  />
                  <AnimatedPath
                    //d="M50 50 L50 1 A49 49 0 0 1 99 50 Z"
                    d="M50 50 L50 0 A50 50 0 0 1 100 50 Z"
                    fill={`${animatedColor}`}
                    style={{ opacity: animatedOpacities[0] }}
                  />

                  {/* Second slice */}
                  {/*  <Path d="M50 50 L99 50 A49 49 0 0 1 50 99 Z" fill={"lightblue"} /> */}
                  <Path
                    d="M50 50 L100 50 A50 50 0 0 1 50 100 Z"
                    fill={sliceBaseColor}
                  />
                  <AnimatedPath
                    //d="M50 50 L99 50 A49 49 0 0 1 50 99 Z"
                    d="M50 50 L100 50 A50 50 0 0 1 50 100 Z"
                    fill={`${animatedColor}`}
                    style={{ opacity: animatedOpacities[1] }}
                  />

                  {/* Third slice */}
                  {/* <Path d="M50 50 L50 99 A49 49 0 0 1 1 50 Z" fill={"lightblue"} /> */}
                  <Path
                    d="M50 50 L50 100 A50 50 0 0 1 0 50 Z"
                    fill={sliceBaseColor}
                  />
                  <AnimatedPath
                    //d="M50 50 L50 99 A49 49 0 0 1 1 50 Z"
                    d="M50 50 L50 100 A50 50 0 0 1 0 50 Z"
                    fill={`${animatedColor}`}
                    style={{ opacity: animatedOpacities[2] }}
                  />

                  {/* Fourth slice */}
                  {/* <Path d="M50 50 L1 50 A49 49 0 0 1 50 1 Z" fill={"lightblue"} /> */}
                  <Path
                    d="M50 50 L0 50 A50 50 0 0 1 50 0 Z"
                    fill={sliceBaseColor}
                  />
                  <AnimatedPath
                    //d="M50 50 L1 50 A49 49 0 0 1 50 1 Z"
                    d="M50 50 L0 50 A50 50 0 0 1 50 0 Z"
                    fill={`${animatedColor}`}
                    style={{ opacity: animatedOpacities[3] }}
                  />

                  {/* border between the slices, commented out the ones with short stroke <- used when I had a border surrounding everything*/}
                  {/* <Path d="M50 50 L50 1" stroke="teal" strokeWidth={1} /> */}
                  <Path d="M50 50 L50 0" stroke="teal" strokeWidth={1} />
                  {/* <Path d="M50 50 L99 50" stroke="teal" strokeWidth={1} /> */}
                  <Path d="M50 50 L100 50" stroke="teal" strokeWidth={1} />
                  {/*  <Path d="M50 50 L50 99" stroke="teal" strokeWidth={1} /> */}
                  <Path d="M50 50 L50 100" stroke="teal" strokeWidth={1} />
                  {/*  <Path d="M50 50 L1 50" stroke="teal" strokeWidth={1} /> */}
                  <Path d="M50 50 L0 50" stroke="teal" strokeWidth={1} />
                </Svg>
              </Shadow>
            </View>

            <View style={{ position: "relative" }}>
              <Text
                style={[
                  styles.timerText,
                  { color: timerColor },
                  timerColor === "red" ? styles.redTextShadow : {},
                ]}
              >
                {timer}
                {/* {timerColor == "red" && "-1"} */}
              </Text>
              {timerColor == "red" && (
                <Text style={styles.minusOneText}>
                  -1{/* right: -48 to match fontSize */}
                </Text>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.startContainer}>
            <Text style={styles.instructionsMessage}>
              Remember the pattern!
            </Text>
            <View style={styles.startButtonContainer}>
              <TouchableOpacity
                onPress={() => {
                  setSequenceComplete(false);
                  setGameIsStarted(true);
                }}
                style={styles.startButton}
              >
                <Text style={styles.startButtonText}>Start</Text>
                <FontAwesome name="play" color={"teal"} size={24} />
              </TouchableOpacity>
            </View>
            <View style={{}}>
              <Text>{""}</Text>
            </View>
          </View>
        ))}
    </View>
  );
}


const AnimatedPath = Animated.createAnimatedComponent(Path);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "teal",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    //height: 300,
    bottom: 0,
  },
  instructionsMessage: {
    fontSize: 30,
    color: "white",
    textAlign: "center",
    //fontWeight: "bold",
    fontFamily: "SourceCodePro-Medium",
  },
  startContainer: {
    display: "flex",
    flex: 1,
    gap: 36,
    width: "100%",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonContainer: {
    display: "flex",
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  startButton: {
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: 280,
    height: 100,
    /*  borderStyle: "solid",
    borderWidth: 1,
    borderColor: "lightblue", */
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 16,
    ...Platform.select({
      ios: {
        // shadow around the whole button, looks elevated
        //shadowColor: 'rgba(0, 150, 136, 1)',
        shadowColor: "black",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
      },
      android: {
        elevation: 20, // shadow on android, only shadow on one side
      },
    }),
  },
  startButtonText: {
    lineHeight: 38, // lineHeight 32 makes it align weird with play-icon
    textAlign: "center",
    color: "teal",
    fontSize: 32,
    // fontWeight: "bold",
    fontFamily: "SourceCodePro-Bold",
  },

  playAgainButton: {
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: 280,
    height: 100,
    //borderStyle: "solid",
    //borderWidth: 1,
    // borderColor: "lightblue",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 16,
  },
  playAgainButtonText: {
    lineHeight: 38, // lineHeight 32 makes it align weird with play-icon
    textAlign: "center",
    color: "teal",
    fontSize: 32,
    // fontWeight: "bold",
    fontFamily: "SourceCodePro-Bold",
  },
  newDiffButton: {
    backgroundColor: "white",
    paddingVertical: 4,
    paddingHorizontal: 8,
    width: 280,
    height: 50,
    //borderStyle: "solid",
    //borderWidth: 1,
    // borderColor: "lightblue",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 16,
  },
  newDiffButtonText: {
    lineHeight: 20, // lineHeight 16 makes it align weird with arrow-left
    textAlign: "center",
    color: "teal",
    fontSize: 16,
    // fontWeight: "bold",
    fontFamily: "SourceCodePro-Bold",
  },
  gameContainer: {
    position: "relative",
    width: 300,
    height: 300,
  },
  characterContainer: {
    position: "absolute",
    width: 100, // doesn't affect the game yet... just wanted to fit the Im Ready text...
    zIndex: 10,
  },
  character: {
    fontSize: 28,
  },
  circleContainer: {
    width: 300,
    height: 300,
    borderRadius: 100,
    position: "relative",
    overflow: "hidden",
  },
  timerText: {
    //color: "white",
    fontSize: 48,
    fontFamily: "SourceCodePro-Medium",
  },
  redTextShadow: {
    textShadowColor: "white",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  minusOneText: {
    position: "absolute",
    right: -60,
    fontSize: 48,
    color: "red",
    textShadowColor: "white",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  gameFinishedView2: {
    display: "flex",
    flex: 1,
    gap: 32,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
    position: "absolute",
    //height: 460,
    borderRadius: 32,
    width: "90%",
    paddingVertical: 32,
    //backgroundColor: "rgba(252, 252, 252, 1)", // Apply opacity to the background color only
    backgroundColor: "teal", // Apply opacity to the background color only
    borderColor: "white",
    borderWidth: 4,
    //backgroundColor: "white",
    /* backgroundColor: "black", */
    /* opacity: 0.5, */
    /* borderWidth: 20,
    borderColor: "white", */
    width: "100%",
  },
  gameFinishedView: {
    display: "flex",
    gap: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 32,
    paddingHorizontal: 24,
    //paddingVertical: 48,
    paddingTop: 60, // 6px less than bottom due to gameFinishedText having 6px larger lineHeight than its fontSize.
    paddingBottom: 66,
  },
  gameFinishedText: {
    /*  zIndex: 60, */
    /* opacity: 1, */
    textAlign: "center",
    fontSize: 48,
    //fontWeight: "bold",
    fontFamily: "SourceCodePro-Bold",
    margin: 0,
    padding: 0,
    lineHeight: 54, // same as fontSize plus a few pixels so shadow fits. Also, this is a bit less lineHeight than default so we dont get too much unwanted height impacting gameFinishedView
    /* color: "white", */
    textShadowColor: "black", // makes the text "pop" more, and makes the red 'You Lost!' blend in better.
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    width: "100%", // otherwise the text shadow is cut off. Also works with padding
  },
  wrongClicksText: {
    marginTop: -6, // gameFinishedText lineHeight 54 - fontsize 48 ??? idk
    fontFamily: "SourceCodePro-Bold",
    lineHeight: 14, // same as fontSize 14, to remove unwanted spacing
  },
});
