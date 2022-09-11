"use strict";

(() => {
  let canvas;
  let ctx;
  let name;
  let pic;
  let numberOfRanks = 6;

  const colors = {
    orange: "#ff7100",
    yellow: "#ffb000",
    pinkwhite: "#f5d3ff",
    blue: "#00b1fa",
    red: "#f00",
  };
  var titles = [
    "Place of birth:",
    "Birthday:",
    "Gender:",
    "Primary Ship:",
    "Ship Name:",
    "Ship ID:",
    "Profession:",
    "Federal Navy Rank:",
    "Imperial Navy Rank:",
  ];
  const keys = [
    "name",
    "birthplace",
    "birthday",
    "gender",
    "ship",
    "shipname",
    "id",
    "profession",
    "fedrank",
    "empirerank",
  ];
  var form;

  if (typeof window.process == "object" && window.process.versions.electron) {
    window.$ = window.jQuery = module.exports;
  }

  $(document).ready(async function () {
    canvas = $("#license")[0];
    ctx = canvas.getContext("2d");
    form = document.forms["licenseform"];

    var imageLoader = document.getElementById("picture");
    imageLoader.addEventListener("change", handleImage, false);
    pic = await loadImage("img/defpic.png");

    let date = new Date();
    let yyyy = `${date.getFullYear() + 1286}`;
    let mm =
      date.getMonth() + 1 < 10
        ? `0${date.getMonth() + 1}`
        : `${date.getMonth() + 1}`;
    let dd = date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`;
    $("#birthday").val(`${yyyy}-${mm}-${dd}`);

    switchBirthdayAndDOI();
    switchOdysseyAndHorizons();
    generate();

    $("body").on("click", "#birthdaydoi", switchBirthdayAndDOI);
    $("body").on("click", "#horizon-switch", switchOdysseyAndHorizons);
    $("body").on("click", "#get-license", generate);
    $("body").on("click", "#save-png", save);
  });

  function switchBirthdayAndDOI() {
    if (form["birthdaydoi"].checked) {
      form["birthday"].labels[0].textContent = "Date Of Issue: ";
      titles[1] = "Date Of Issue: ";
    } else {
      form["birthday"].labels[0].textContent = "Birthday: ";
      titles[1] = "Birthday: ";
    }
  }

  function switchOdysseyAndHorizons() {
    if (form["horizon-switch"].checked) {
      numberOfRanks = 4;
      $("label[for=exobiology], label[for=mercenary]").hide();
    } else {
      numberOfRanks = 6;
      $("label[for=exobiology], label[for=mercenary]").show();
    }
  }

  async function generate() {
    colors.ui = form["color"].value;

    //Clear previous
    ctx.textAlign = "start";
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = colors.ui;

    await drawLicenseHeader();
    await drawAvatar();
    await drawTableHeader();
    await drawTable();
    await drawRanks();
    await drawTripleElite();

    //Draw background
    ctx.globalCompositeOperation = "destination-over";
    drawImageFromSource("img/background.png", 22, 15);
  }

  function getRankImagePath(type, rankIndex) {
    rankIndex = parseInt(rankIndex, 10);
    rankIndex = Math.min(9, Math.max(1, rankIndex)); // Clamp between 1 and 9

    return `img/rank/${type}/rank${rankIndex}.png`;
  }

  async function drawLicenseHeader() {
    //Draw pilot fed logo and color it
    await drawImageFromSource("img/pilotfedlogo.png", 75, 50);
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillRect(75, 50, 200, 200);
    ctx.globalCompositeOperation = "source-over";

    //Draw the title
    ctx.font = "50px eurocaps";
    ctx.fillText("Pilots Federation", 290, 100);
    ctx.font = "100px eurocaps";
    ctx.fillText("Commander License", 285, 175);
  }

  async function drawAvatar() {
    //Draw the uploaded picture with rounded corners
    ctx.save();
    ctx.fillStyle = "transparent";
    roundRect(45, 275, 525, 525, 20);
    ctx.clip();
    await drawImage(pic, 45, 275, 525, 525);
    ctx.restore();
  }

  async function drawTableHeader() {
    //Draw CMDR name and underline
    if (form["name"].value) {
      name = form["name"].value;
    } else {
      name = form["name"].placeholder;
    }
    //Scale name based on width
    const commanderName = `CMDR ${name}`;
    ctx.font =
      Math.min((100 / ctx.measureText(commanderName).width) * 750, 100) +
      "px eurocaps";
    ctx.fillText(commanderName, 600, 350);
    ctx.fillRect(590, 360, 1300, 5);

    //Draw faction icon based on name width and color it
    await drawImageFromSource(
      `img/factions/${form["faction"].value}.png`,
      600 + ctx.measureText(commanderName).width + 50,
      275
    );
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillRect(
      600 + ctx.measureText(commanderName).width + 50,
      275,
      200,
      200
    );
    ctx.globalCompositeOperation = "source-over";
  }

  async function drawTable() {
    //Draw all titles
    ctx.font = "37px eurocaps";
    let i = 1;
    let offset = 47;
    for (let title of titles) {
      ctx.fillText(title, 600, 360 + i * offset);
      ctx.fillRect(590, 370 + i * offset, 1300, 5);
      i++;
    }
    //Draw title values
    i = 1;
    for (let key of keys) {
      if (key == keys[0]) {
        continue;
      }
      if (form[key].value) {
        ctx.fillText(form[key].value, 1000, 360 + i * offset);
      } else {
        ctx.fillText(form[key].placeholder, 1000, 360 + i * offset);
      }
      i++;
    }
  }

  async function drawRanks() {
    ctx.font = "32px eurocaps";
    ctx.textAlign = "center";

    const leftRankMargin = 70;
    const rightRankMargin = 70;
    const rankPadding = 150;
    const rankBoxSize =
      (canvas.width -
        leftRankMargin -
        rightRankMargin -
        (numberOfRanks - 1) * rankPadding) /
      numberOfRanks;
    const rankSize = 0.8 * rankBoxSize;
    const rankY = 980;

    //Combat rank
    let combatRank = form["combat"].value;
    ctx.fillStyle = colors.yellow;
    let combatX = leftRankMargin + 0 * rankPadding + rankBoxSize * 0.5;
    ctx.fillText("Combat", combatX, 870);
    await drawCenteredImage(
      "img/rank/combat/BG.png",
      combatX,
      rankY + 16,
      rankBoxSize + 35,
      rankBoxSize
    );
    await drawCenteredImage(
      getRankImagePath("combat", combatRank),
      combatX,
      rankY,
      rankSize,
      rankSize
    );
    drawPrestigeStars("combat", combatRank, combatX, rankY, rankSize);
    ctx.fillText(form["combat"].children[combatRank].label, combatX, 1160);

    //Trade rank
    let tradeRank = form["trade"].value;
    ctx.fillStyle = colors.pinkwhite;
    let tradeX = leftRankMargin + 1 * rankPadding + rankBoxSize * 1.5;
    ctx.fillText("Trade", tradeX, 870);
    await drawCenteredImage(
      "img/rank/trade/BG.png",
      tradeX,
      rankY + 30,
      rankBoxSize,
      rankBoxSize
    );
    await drawCenteredImage(
      getRankImagePath("trade", tradeRank),
      tradeX,
      rankY,
      rankSize,
      rankSize
    );
    drawPrestigeStars("trade", tradeRank, tradeX, rankY, rankSize);
    ctx.fillText(form["trade"].children[tradeRank].label, tradeX, 1160);

    //Explorer rank
    const explorerRank = form["explorer"].value;
    ctx.fillStyle = colors.blue;
    let explorerX = leftRankMargin + 2 * rankPadding + rankBoxSize * 2.5;
    ctx.fillText("Explorer", explorerX, 870);
    await drawCenteredImage(
      "img/rank/explorer/BG.png",
      explorerX,
      rankY,
      rankBoxSize,
      rankBoxSize
    );
    await drawCenteredImage(
      getRankImagePath("explorer", explorerRank),
      explorerX,
      rankY,
      rankSize,
      rankSize
    );
    drawPrestigeStars("explorer", explorerRank, explorerX, rankY, rankSize);
    ctx.fillText(
      form["explorer"].children[explorerRank].label,
      explorerX,
      1160
    );

    if (!form["horizon-switch"].checked) {
      //Mercenary rank
      const mercenaryRank = form["mercenary"].value;
      ctx.fillStyle = colors.yellow;
      let mercenaryX = leftRankMargin + 3 * rankPadding + rankBoxSize * 3.5;
      ctx.fillText("Mercenary", mercenaryX, 870);
      await drawCenteredImage(
        getRankImagePath("mercenary", mercenaryRank),
        mercenaryX,
        rankY,
        rankSize,
        rankSize
      );
      drawPrestigeStars(
        "mercenary",
        mercenaryRank,
        mercenaryX,
        rankY,
        rankSize
      );
      ctx.fillText(
        form["mercenary"].children[mercenaryRank].label,
        mercenaryX,
        1160
      );
    }

    if (!form["horizon-switch"].checked) {
      //Exobiology rank
      let exobiologyRank = form["exobiology"].value;
      ctx.fillStyle = colors.blue;
      let exobiologyX = leftRankMargin + 4 * rankPadding + rankBoxSize * 4.5;
      ctx.fillText("Exobiology", exobiologyX, 870);
      await drawCenteredImage(
        getRankImagePath("exobiology", exobiologyRank),
        exobiologyX,
        rankY,
        rankSize,
        rankSize
      );
      drawPrestigeStars(
        "exobiology",
        exobiologyRank,
        exobiologyX,
        rankY,
        rankSize
      );
      ctx.fillText(
        form["exobiology"].children[exobiologyRank].label,
        exobiologyX,
        1160
      );
    }

    //CQC rank
    let cqcRank = form["cqc"].value;
    ctx.fillStyle = colors.red;
    const cqcPosition = form["horizon-switch"].checked ? 4 : 6;
    let cqcX =
      leftRankMargin +
      (cqcPosition - 1) * rankPadding +
      rankBoxSize * (cqcPosition - 0.5);
    ctx.fillText("CQC", cqcX, 870);
    await drawCenteredImage(
      "img/rank/cqc/BG.png",
      cqcX,
      rankY - 16,
      rankBoxSize,
      rankBoxSize
    );
    await drawCenteredImage(
      getRankImagePath("cqc", cqcRank),
      cqcX,
      rankY,
      rankSize,
      rankSize
    );
    drawPrestigeStars("cqc", cqcRank, cqcX, rankY, rankSize);
    ctx.fillText(form["cqc"].children[cqcRank].label, cqcX, 1160);
  }

  async function drawTripleElite() {
    //If triple elite, draw the overlay and color it
    if (
      form["combat"].value >= 9 &&
      form["trade"].value >= 9 &&
      form["explorer"].value >= 9
    ) {
      ctx.fillStyle = colors.ui;
      await drawImageFromSource("img/tripleelite.png", 68, 60);
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillRect(68, 60, 200, 200);
      ctx.globalCompositeOperation = "source-over";
    }
  }

  async function drawPrestigeStars(
    type,
    rankIndex,
    centerX,
    centerY,
    rankSize
  ) {
    if (rankIndex <= 9) {
      return;
    }

    const numberOfStars = (9 - rankIndex) * -1;
    const starPath = `img/rank/${type}/star.png`;

    switch (numberOfStars) {
      case 4:
        drawCenteredImage(
          starPath,
          centerX - 0.4 * rankSize,
          centerY + rankSize / 2 + 22,
          30,
          30
        );
        drawCenteredImage(
          starPath,
          centerX + 0.4 * rankSize,
          centerY + rankSize / 2 + 22,
          30,
          30
        );
      case 2:
        drawCenteredImage(
          starPath,
          centerX - 0.15 * rankSize,
          centerY + rankSize / 2 + 38,
          30,
          30
        );
        drawCenteredImage(
          starPath,
          centerX + 0.15 * rankSize,
          centerY + rankSize / 2 + 38,
          30,
          30
        );
        break;

      case 5:
        drawCenteredImage(
          starPath,
          centerX - 0.55 * rankSize,
          centerY + rankSize / 2 + 5,
          30,
          30
        );
        drawCenteredImage(
          starPath,
          centerX + 0.55 * rankSize,
          centerY + rankSize / 2 + 5,
          30,
          30
        );
      case 3:
        drawCenteredImage(
          starPath,
          centerX - 0.3 * rankSize,
          centerY + rankSize / 2 + 33,
          30,
          30
        );
        drawCenteredImage(
          starPath,
          centerX + 0.3 * rankSize,
          centerY + rankSize / 2 + 33,
          30,
          30
        );
      case 1:
        drawCenteredImage(
          starPath,
          centerX,
          centerY + rankSize / 2 + 45,
          30,
          30
        );
        break;
    }
  }

  async function drawImageFromSource(src, x, y, width = null, height = null) {
    var img = await loadImage(src);
    drawImage(img, x, y, width, height);
    return;
  }

  async function drawImage(img, x, y, width = null, height = null) {
    width && height
      ? ctx.drawImage(img, x, y, width, height)
      : ctx.drawImage(img, x, y);
    return;
  }

  async function drawCenteredImage(
    src,
    x,
    y,
    maxWidth = null,
    maxHeight = null
  ) {
    var img = await loadImage(src);
    if (maxWidth === null) {
      maxWidth = img.width;
    }
    if (maxHeight === null) {
      maxHeight = img.height;
    }

    const width = Math.min(
      maxWidth,
      img.width,
      (img.width / img.height) * maxWidth
    );
    const height = Math.min(
      maxHeight,
      img.height,
      (img.height / img.width) * width
    );

    x -= width / 2;
    y -= height / 2;

    drawImage(img, x, y, width, height);
    return;
  }

  function loadImage(src) {
    return new Promise((r) => {
      let i = new Image();
      i.onload = () => r(i);
      i.src = src;
    });
  }

  function handleImage(e) {
    var reader = new FileReader();
    reader.onload = function (event) {
      var img = new Image();
      img.onload = function () {
        pic = img;
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
  }

  async function save() {
    //await Generate();
    var link = $("#link")[0];
    link.setAttribute("download", `CMDRLicense-${name}.png`);
    link.setAttribute(
      "href",
      canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")
    );
    link.click();
  }

  function roundRect(x, y, width, height, radius) {
    if (typeof radius === "undefined") {
      radius = 5;
    } else if (typeof radius === "number") {
      radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
      var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
      for (var side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
      }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius.br,
      y + height
    );
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    ctx.fill();
  }
})();
