import React, { useState, useRef } from "react";
import "./TextBox.css"; 

const TextBox = () => {
  const [boxes, setBoxes] = useState([]);

  const addBox = (e) => {
    const newBox = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
      width: 200,
      height: 100,
      text: " ",
    };
    setBoxes([...boxes, newBox]);
  };

  const removeBox = (id) => {
    setBoxes(boxes.filter((box) => box.id !== id));
  };

  const handleDrag = (e, box, index) => {
    const updatedBoxes = [...boxes];
    updatedBoxes[index] = {
      ...box,
      x: e.clientX - 50,
      y: e.clientY - 20,
    };
    setBoxes(updatedBoxes);
  };

  const handleResize = (e, box, index, direction) => {
    const updatedBoxes = [...boxes];
    const newBox = { ...box };

    if (direction.includes("right")) {
      newBox.width = Math.max(100, e.clientX - box.x);
    }
    if (direction.includes("bottom")) {
      newBox.height = Math.max(50, e.clientY - box.y);
    }

    updatedBoxes[index] = newBox;
    setBoxes(updatedBoxes);
  };

  return (
    <div
      className="textbox-container"
      onDoubleClick={(e) => addBox(e)}
      style={{ width: "60vw", height: "60vh", position: "relative" }}
    >
      {boxes.map((box, index) => (
        <div
          key={box.id}
          className="textbox"
          style={{
            position: "absolute",
            left: box.x,
            top: box.y,
            width: box.width,
            height: box.height,
            resize: "none",
            overflow: "auto",
          }}
          onMouseDown={(e) => {
            const handleMouseMove = (event) => handleDrag(event, box, index);

            const handleMouseUp = () => {
              document.removeEventListener("mousemove", handleMouseMove);
              document.removeEventListener("mouseup", handleMouseUp);
            };

            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
          }}
        >
          <div className="textbox-header">
            <button
              className="close-btn"
              onClick={() => removeBox(box.id)}
            >
              &times;
            </button>
          </div>
          <textarea
            className="textbox-content"
            value={box.text}
            onChange={(e) => {
              const updatedBoxes = [...boxes];
              updatedBoxes[index] = { ...box, text: e.target.value };
              setBoxes(updatedBoxes);
            }}
            placeholder=" Add here..."
          />
          <div
            className="resize-handle resize-handle-right"
            onMouseDown={(e) => {
              e.stopPropagation();
              const handleMouseMove = (event) => handleResize(event, box, index, "right");

              const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
              };

              document.addEventListener("mousemove", handleMouseMove);
              document.addEventListener("mouseup", handleMouseUp);
            }}
          ></div>
          <div
            className="resize-handle resize-handle-bottom"
            onMouseDown={(e) => {
              e.stopPropagation();
              const handleMouseMove = (event) => handleResize(event, box, index, "bottom");

              const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
              };

              document.addEventListener("mousemove", handleMouseMove);
              document.addEventListener("mouseup", handleMouseUp);
            }}
          ></div>
        </div>
      ))}
    </div>
  );
};

export default TextBox;
