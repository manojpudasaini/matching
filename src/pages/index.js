import { matchData } from "@/utils/matchData";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const canvas = useRef(null);
  let canvasWrapper = useRef(null);
  const canvasElement = useRef(null);
  const ctx = useRef(null);
  const [matchedData, setMatchedData] = useState([]);
  const [interactionData, setInteractionData] = useState(matchData);
  let isMousePressed = false;
  let initPosition;
  let trackOfLines = [];
  useEffect(() => {
    if (canvas.current) {
      canvasElement.current = canvas.current;
      ctx.current = canvasElement.current.getContext("2d");
    }
  }, []);

  useEffect(() => {
    if (canvasElement.current) {
      canvasElement.current.height = canvasWrapper.current.clientHeight;
      canvasElement.current.width = canvasWrapper.current.clientWidth;
    }
  }, [canvasWrapper.current]);

  const startDrawingLine = (event, index, item) => {
    if (trackOfLines.length) {
      for (let line of trackOfLines) {
        if (line?.start?.id === index) {
          return;
        }
      }
    }
    initPosition = {
      x: event.clientX - canvasElement.current.offsetLeft,
      y: event.clientY - canvasElement.current.offsetTop,
    };
    trackOfLines = [
      ...trackOfLines,
      {
        start: {
          x: initPosition.x,
          y: initPosition.y,
          id: index,
          url: item.imageUrl,
        },
      },
    ];
    const line = {
      start: initPosition,
      end: initPosition,
      lineWidth: 5,
      lineCap: "round",
      strokeStyle: "green",
    };
    isMousePressed = true;
    drawLineInCanvas(line);
  };
  const drawLineInCanvas = (line) => {
    const { start, end, lineWidth, lineCap, strokeStyle } = line;
    if (!start || !end) throw new Error("Start or end is not defined");
    ctx.current.beginPath();
    ctx.current.moveTo(start.x, start.y);
    ctx.current.lineTo(end.x, end.y);
    ctx.current.lineWidth = lineWidth;
    ctx.current.lineCap = lineCap;
    ctx.current.strokeStyle = strokeStyle;
    ctx.current.stroke();
    drawPreviousLines(ctx.current);
    canvasElement.current.onmousemove = (event) => {
      if (isMousePressed) {
        let currentPosition = {
          x: event.clientX - canvasElement.current.offsetLeft,
          y: event.clientY - canvasElement.current.offsetTop,
        };
        let line = {
          start: initPosition,
          end: currentPosition,
        };
        ctx.current.clearRect(
          0,
          0,
          canvasElement.current.width,
          canvasElement.current.height
        );
        drawLineInCanvas(line);
      }
    };
  };

  function drawPreviousLines(ctx) {
    if (!trackOfLines.length) {
      return;
    }
    for (let coordinateObj of trackOfLines) {
      if (!coordinateObj?.start || !coordinateObj?.end) {
        break;
      }
      ctx.strokeStyle = "green";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(coordinateObj.start.x, coordinateObj.start.y);
      ctx.lineTo(coordinateObj.end.x, coordinateObj.end.y);
      ctx.stroke();
    }
  }

  function endDrawingLine(event, key, item) {
    if (!trackOfLines.length) {
      return;
    }
    for (let line of trackOfLines) {
      if (line?.end?.id === key) {
        return;
      }
    }

    isMousePressed = false;
    let currentPosition = {
      x: event.clientX - canvasElement.current.offsetLeft,
      y: event.clientY - canvasElement.current.offsetTop,
    };
    trackOfLines[trackOfLines.length - 1]["end"] = {};
    trackOfLines[trackOfLines.length - 1]["end"]["x"] = currentPosition.x;
    trackOfLines[trackOfLines.length - 1]["end"]["y"] = currentPosition.y;
    trackOfLines[trackOfLines.length - 1]["end"]["id"] = key;
    trackOfLines[trackOfLines.length - 1]["end"]["url"] = item.imageUrl;
  }

  function checkAnswerHandler() {
    let flag;
    flag = trackOfLines.every((item) => item.start.url === item.end.url);
    console.log(flag);
    return flag;
  }

  return (
    <>
      <main className="flex p-24">
        <div className={"flex flex-col space-y-4"}>
          {interactionData?.map((item, index) => (
            <div
              className={
                "border-2 border-amber-400 rounded-lg relative h-20 w-20 p-2"
              }
              key={item.name}
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                height={80}
                width={80}
                draggable={"false"}
                className={"pointer-events-none"}
              />
              <div
                id={"drawStart"}
                className={
                  "border-2 border-gray-700 rounded-full h-4 w-4 absolute top-1/2  -translate-y-1/2 -right-3 bg-white z-10 pointer-events-auto"
                }
                onClick={(event) => startDrawingLine(event, index, item)}
              />
            </div>
          ))}
        </div>
        <div ref={canvasWrapper}>
          <canvas ref={canvas} />
        </div>
        <div className={"flex flex-col space-y-6 py-10"}>
          {interactionData?.map((item, index) => (
            <div
              className={"p-2 border-2 border-amber-400 rounded-lg relative"}
              key={item.name}
            >
              <p className={"px-2 py-1 text-center"}>{item.name}</p>
              <div
                onClick={(event) => endDrawingLine(event, index, item)}
                id={"drawEnd"}
                className={
                  "border-2 border-gray-700 rounded-full h-4 w-4 absolute top-1/2  -translate-y-1/2  -left-2 bg-white z-10 pointer-events-auto "
                }
              />
            </div>
          ))}
        </div>
      </main>
      <button
        className={
          "px-4 py-2 bg-amber-500 text-white font-semibold text-xl rounded-md mx-20"
        }
        onClick={() => checkAnswerHandler()}
      >
        Check answer
      </button>
    </>
  );
}
