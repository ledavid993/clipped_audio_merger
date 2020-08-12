export default `
<html>
<body 
  style="
  background: aliceblue;
  max-height: 700px;
  max-width: 700px;
  min-height: 500px;
  min-width: 500px;
  "
>
  <div
  class="container"
  style="
    background: aliceblue;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    max-height: 700px;
    max-width: 700px;
    min-height: 500px;
    min-width: 500px;
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
      align-items: center;
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
</body>
<html>
`
