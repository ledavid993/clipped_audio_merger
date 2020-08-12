export default `
<html>
  <body
    style="
      min-height: 800px;
      max-height: 1000px;
      min-width: 800px;
      max-width: 1000px;
      background: aliceblue;
      overflow: hidden;
    "
  >
    <div
      class="main-container"
      style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      "
    >
      %images%
      <div
        class="right-container"
        style="
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          text-align: center;
        "
      >
        <div
          id="question"
          style="
            align-items: center;
            color: rgba(0, 0, 0, 0.8);
            display: flex;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 20px;
            font-weight: bold;
            justify-content: center;
            padding: 10px;
            width: 90%;
          "
        >
          <div
            style="
              align-items: center;
              display: flex;
              flex-direction: column;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-weight: bold;
              justify-content: center;
              padding: 10px;
              width: 90%;
            "
          >
            <h4 style="color: rgba(0, 0, 0, 0.6);">Questions</h4>
           %question%
          </div>
        </div>
        <div
          id="answer"
          style="
            color: #289c28;
            display: flex;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-weight: bold;
            justify-content: center;
            padding: 10px;
            width: 90%;
          "
        >
          <div
            style="
              align-items: center;
              display: flex;
              flex-direction: column;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-weight: bold;
              justify-content: center;
              padding: 10px;
              width: 90%;
            "
          >
            <h4 style="color: #35ce35;">Answer</h4>
            %answer%
          </div>
        </div>
      </div>
    </div>
  </body>
</html>

`
