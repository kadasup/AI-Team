/* ==========================================================================
   荒島求生大冒險 — 分支劇情資料 + 互動邏輯
   節點格式：
   {
     chapter: "章節小標籤（可省略）",
     description: "敘事文字",
     isEnding: true/false,
     endingTitle: "結局：XXX"（僅結局節點需要）,
     choices: [ { text: "選項文字", next: "下一個節點 id" }, ... ]
   }
   ========================================================================== */

const STORY = {
  // ---------------- 開場 ----------------
  start: {
    chapter: "序章．船難",
    description:
      "暴風雨把「海燕號」撕成碎片的那一夜，你緊抱著一塊船板，在漆黑的海浪裡浮浮沉沉。\n\n" +
      "當你再次睜開眼，臉頰貼著溫熱的細沙，耳邊是海浪規律的拍打聲。你爬起來，發現自己躺在一片新月形的沙灘上，身後是一整片濃密到看不見盡頭的叢林，頭頂的天空藍得不像話。\n\n" +
      "你活下來了——但這裡是哪裡？",
    choices: [
      { text: "往叢林深處探索，找找看有沒有淡水和食物", next: "jungle_entrance" },
      { text: "沿著海岸線走，先摸清這座島的輪廓", next: "coast_walk" },
    ],
  },

  // ---------------- 叢林支線 ----------------
  jungle_entrance: {
    chapter: "第一章．入林",
    description:
      "叢林裡潮濕悶熱，藤蔓像簾子一樣垂下來。走沒多久，你聽見前方傳來說話聲——不是你的想像，是真的有人聲。\n\n" +
      "撥開樹葉，你看見一個皮膚曬得黝黑、穿著獸皮背心的男人正蹲在地上生火，他察覺到你，抬頭朝你微笑，朝你招了招手。",
    choices: [
      { text: "上前和他攀談，跟著他走", next: "stranger_camp" },
      { text: "保持戒心，假裝沒看見，自己另尋路線", next: "jungle_deep" },
    ],
  },

  jungle_deep: {
    chapter: "第二章．深林孤行",
    description:
      "你決定不去招惹那個陌生人，悄悄繞道而行。叢林越來越密，藤蔓纏繞著奇形怪狀的巨樹，偶爾傳來不知名鳥類的怪叫聲。\n\n" +
      "走了將近一小時，眼前出現岔路：一邊是陡峭向上、隱約可見天光的山徑；另一邊是一個幽暗、飄著涼氣的洞穴入口，洞口刻著模糊的古老符號。",
    choices: [
      { text: "爬上山頂，居高臨下看看整座島", next: "mountain_top" },
      { text: "壯著膽子走進洞穴一探究竟", next: "cave_solo" },
    ],
  },

  mountain_top: {
    chapter: "第三章．山頂視野",
    description:
      "汗流浹背地爬到山頂，眼前的景象讓你倒抽一口氣：這座島比想像中大得多，島的另一端隱約有裊裊炊煙，而更遠的海平面上，你居然看到一個小小的、緩慢移動的光點——像是一艘船。\n\n" +
      "你摸摸口袋，還留著一個從船難殘骸撿到的打火機。",
    choices: [
      { text: "立刻收集乾柴，升起求救的濃煙", next: "ending_rescued" },
      { text: "先按捺住，觀察那道炊煙是敵是友，晚點再做打算", next: "ending_watch_smoke" },
    ],
  },

  cave_solo: {
    chapter: "第三章．獨闖洞穴",
    description:
      "洞穴比想像中深邃，你摸黑往前走，指尖劃過潮濕的岩壁。轉過一個彎道後，眼前豁然開朗——一個天然形成的地下岩洞，中央赫然堆著半人高的金銀器物與寶石，在微弱天光下閃閃發亮。\n\n" +
      "但你也注意到，洞穴深處的岩壁上，有一排排像是警告，又像是詛咒的刻痕，還有幾具早已風化的白骨躺在寶藏堆旁邊。",
    choices: [
      { text: "不顧一切，盡可能把寶物塞進背包帶走", next: "ending_cursed_treasure" },
      { text: "只拿走足夠證明寶藏存在的一小塊，其餘原封不動地離開", next: "ending_wise_retreat" },
    ],
  },

  // ---------------- 陌生人支線 ----------------
  stranger_camp: {
    chapter: "第二章．陌生人的營地",
    description:
      "他自稱「阿卡」，是多年前也曾遇難漂流到這座島的倖存者。他的營地整理得很好，篝火旁擺著幾串烤魚，還有一顆你從沒見過、通體泛著淡紫光澤的果實。\n\n" +
      "「吃了它，」阿卡把果實遞給你，眼神有些難以捉摸，「這座島的秘密，只有相信它的人才看得見。」",
    choices: [
      { text: "半信半疑地咬下那顆奇異的果實", next: "ending_island_spirit" },
      { text: "婉拒果實，禮貌地把話題引開", next: "stranger_reveal" },
    ],
  },

  stranger_reveal: {
    chapter: "第三章．真面目",
    description:
      "阿卡臉色微微一變，隨即恢復笑容，只是眼神多了一絲審視。閒聊間，你留意到他營地深處堆著好幾套不同款式、明顯屬於「其他船難者」的衣物與行李。\n\n" +
      "他忽然壓低聲音：「其實這座島上不只我們兩個——還有一群人，我需要你的幫忙，才能真正離開這裡。」你必須立刻決定要不要信他。",
    choices: [
      { text: "選擇相信阿卡，答應與他聯手行動", next: "ending_ally_escape" },
      { text: "心生警覺，趁他不注意時悄悄逃離營地", next: "flee_stranger" },
    ],
  },

  flee_stranger: {
    chapter: "第四章．倉皇逃離",
    description:
      "你趁阿卡轉身添柴火的瞬間，鑽進樹叢拔腿就跑，身後隱約傳來他的叫喊聲，你不敢回頭。\n\n" +
      "跑了許久，四周的植被變得陌生，你已經完全迷失了方向感。眼前只剩兩個選擇：往地勢較低、隱約聽得見水聲的方向走；或是找個高處先躲起來，等天亮再打算。",
    choices: [
      { text: "循著水聲往低處走，賭一把找到水源或出路", next: "ending_lost_in_wild" },
      { text: "找棵大樹爬上去躲藏，等待天亮再說", next: "ending_survivor_hermit" },
    ],
  },

  // ---------------- 海岸支線 ----------------
  coast_walk: {
    chapter: "第一章．沿岸偵察",
    description:
      "你沿著海岸線慢慢走，海水清澈見底，能看見色彩斑斕的魚群。走了約莫一公里，你發現沙灘上插著一支破舊的船槳，旁邊用貝殼排出一個箭頭符號，指向內陸。\n\n" +
      "這顯然是「人為」留下的痕跡——代表這座島上，或曾經有其他人存在過。",
    choices: [
      { text: "順著貝殼箭頭的指示，往內陸走去查看", next: "follow_arrow" },
      { text: "不理會這個訊號，繼續沿著海岸線前進", next: "coast_further" },
    ],
  },

  follow_arrow: {
    chapter: "第二章．追尋線索",
    description:
      "貝殼箭頭一路引著你穿過矮樹叢，最終停在一棵老榕樹下——樹幹上刻著密密麻麻的正字記號，看起來是有人在這裡數著日子，記號旁邊還歪歪扭扭刻著一行字：「往東走，有水源。當心夜晚的哭聲。」\n\n" +
      "你抬頭看看太陽的方位，辨認出東邊的方向就在不遠處的一片竹林之後。",
    choices: [
      { text: "不理會警告，趁著白天往東邊尋找水源", next: "east_spring" },
      { text: "在原地紮營觀察，親眼確認「夜晚的哭聲」是什麼", next: "ending_night_cry" },
    ],
  },

  east_spring: {
    chapter: "第三章．竹林深處",
    description:
      "穿過竹林後，你找到了那處水源——一個清澈的天然水潭，水潭邊立著一塊粗糙的木牌路標，一邊寫著「海灣．漁村遺跡」，另一邊寫著「懸崖．瞭望台」。\n\n" +
      "看來這座島上真的曾經有人定居過，而且似乎還留下了一些可以利用的設施。",
    choices: [
      { text: "前往漁村遺跡，看看能不能找到可用的工具或船隻", next: "ending_island_ruler" },
      { text: "爬上懸崖瞭望台，居高臨下確認獲救的機會", next: "cliff_lookout" },
    ],
  },

  cliff_lookout: {
    chapter: "第四章．懸崖瞭望",
    description:
      "瞭望台雖已半毀，但視野極佳。你看見遠方海面上有一條隱約的航道，偶爔會有船隻經過；同時你也注意到，瞭望台的欄杆早已腐朽，稍有不慎就會墜落。\n\n" +
      "你必須小心行動，同時決定要不要冒險留在這裡等待、揮舞求救訊號。",
    choices: [
      { text: "謹慎固定好身體重心，撐起衣物揮舞求救", next: "ending_rescued" },
      { text: "心急之下貿然靠近欄杆邊緣張望", next: "ending_cliff_fall" },
    ],
  },

  coast_further: {
    chapter: "第二章．遠方的風暴",
    description:
      "你選擇無視那個奇怪的箭頭，繼續沿著海岸線前進。天色漸漸暗下來，遠方海面上竟又聚集起厚重的烏雲，狂風開始呼嘯，你所在的沙灘地勢低窪，海水正一點一點地往你的方向逼近。\n\n" +
      "你必須立刻做出反應。",
    choices: [
      { text: "拚命往地勢較高的礁岩區跑去避難", next: "ending_survivor_hermit" },
      { text: "冒險回頭尋找剛才看到的貝殼箭頭路線", next: "follow_arrow" },
    ],
  },

  // ---------------- 結局節點（共 6 種） ----------------
  ending_rescued: {
    isEnding: true,
    endingTitle: "結局：狼煙引路，重返文明",
    description:
      "濃煙筆直沖上天際，你的心臟隨著遠方那艘船隻逐漸調轉的船頭一起狂跳。三個小時後，一艘漁船緩緩靠近岸邊，甲板上的船員朝你揮手大喊。\n\n" +
      "當你踏上甲板的那一刻，雙腿一軟跪坐下來——這場荒島漂流，終於畫下句點。回到文明世界後，你把這段經歷寫成了一本暢銷書，扉頁寫著：「獻給那座教會我如何活下去的島。」",
  },

  ending_watch_smoke: {
    isEnding: true,
    endingTitle: "結局：與島共生，島主新生活",
    description:
      "你按捺住立刻求救的衝動，悄悄朝那道炊煙的方向觀察了三天。原來島的另一端住著一小群早已在此定居的漁民後裔，他們對外界的船隻始終保持警戒，卻對真心想留下來的人格外友善。\n\n" +
      "你選擇留下，用你的知識幫他們改善了灌溉與捕魚的方法，換來了一席之地與尊重。多年後，你成了這座島上受人敬重的「外來島主」，偶爾望著海平面，卻再也不覺得自己需要離開。",
  },

  ending_cursed_treasure: {
    isEnding: true,
    endingTitle: "結局：滿載寶藏，代價慘重",
    description:
      "你把能塞的金銀珠寶通通塞進背包，貪婪地連刻痕警告都沒細看幾眼。走出洞穴的瞬間，天空忽然暗下，一陣不尋常的落石從洞頂傾瀉而下。\n\n" +
      "你僥倖逃出，卻在混亂中摔斷了腿，往後只能拖著傷腿、守著這堆再也無法親自帶離小島的寶藏度過餘生。你終於得到了財富，卻永遠失去了走出這座島的機會。",
  },

  ending_wise_retreat: {
    isEnding: true,
    endingTitle: "結局：適可而止，全身而退",
    description:
      "你壓下心裡的貪念，只拿走一小塊足以證明寶藏存在的金飾，便轉身退出了洞穴，沒有驚動那些沉睡已久的詛咒刻痕。\n\n" +
      "幾週後，你憑著清晰的頭腦與求生技巧，利用潮汐與洋流的規律，用漂流木做成簡易木筏成功離島獲救。你帶回的那塊金飾成了博物館的展品，人們都說，你是靠著「懂得適可而止」才活著回來的人。",
  },

  ending_island_spirit: {
    isEnding: true,
    endingTitle: "結局：化為島之精魂",
    description:
      "果實入口的瞬間，一股奇異的暖流從喉頭竄向四肢百骸。你眼前的世界忽然變得色彩斑斕——你能聽懂風的語言，能看見樹根下流動的水脈，阿卡在一旁露出了然的微笑：「歡迎回家，島一直在等一個新的守護者。」\n\n" +
      "從那天起，再也沒有人見過你離開這座島。但每當有船隻在暴風雨中迷航靠近，總會有一陣恰到好處的風，靜靜把他們引向安全的港灣——那是你留下的、屬於這座島的溫柔。",
  },

  ending_ally_escape: {
    isEnding: true,
    endingTitle: "結局：攜手同行，共渡難關",
    description:
      "你選擇相信阿卡。原來他口中「還有一群人」，是幾位同樣渴望離開小島、卻苦於勢單力薄的倖存者。你們齊心合力，花了將近一個月收集浮木與船帆殘片，打造出一艘足以出海的木筏。\n\n" +
      "啟航那天，所有人都在沙灘上歡呼。這段患難與共的情誼，成了你日後回想起這座島時，唯一慶幸而溫暖的記憶。",
  },

  ending_lost_in_wild: {
    isEnding: true,
    endingTitle: "結局：迷失荒野，音訊全無",
    description:
      "你循著水聲一路往低處奔去，卻沒想到那並非水源，而是一片看似平靜、實則暗藏流沙的沼澤地。你越是掙扎，陷得越深，四周茂密的植被吞沒了你求救的呼喊。\n\n" +
      "這座島從此多了一個不為人知的秘密，而你的故事，永遠停在了那個慌不擇路的夜晚。",
  },

  ending_survivor_hermit: {
    isEnding: true,
    endingTitle: "結局：隱居礁岩，孤獨求生者",
    description:
      "你找了個相對安全的高處躲避風暴與未知的危險，日復一日靠著採集貝類與雨水維生，逐漸摸索出一套屬於自己的生存節奏。\n\n" +
      "你沒有再遇見阿卡，也沒有等到任何船隻。許多年過去，你成了一個把整座荒島摸得一清二楚的孤獨隱士——活了下來，卻也把「回去」這件事，漸漸放下了。",
  },

  ending_night_cry: {
    isEnding: true,
    endingTitle: "結局：夜半驚魂，倉皇離島",
    description:
      "入夜之後，樹林深處果然傳來斷斷續續、彷彿人聲又不似人聲的哭泣聲，越來越近。你嚇得魂飛魄散，來不及多想，抓起隨身的東西沒命地往海邊跑，跳上退潮時擱淺在沙灘上的一艘破舊小艇，拚死划向大海。\n\n" +
      "隔天你被一艘貨輪救起，但那晚的哭聲究竟是什麼，成了你這輩子解不開、也不敢再深究的謎。至少，你活著回來了。",
  },

  ending_cliff_fall: {
    isEnding: true,
    endingTitle: "結局：功虧一簣，墜落懸崖",
    description:
      "求生的焦躁讓你失了分寸，你顧不得腐朽的欄杆，一心只想看得更清楚，結果腳下的木板應聲斷裂。\n\n" +
      "在墜落的瞬間，你腦中閃過的最後畫面，是那條你差一點就能等到的、緩緩靠近的船影。有些時候，最大的危險不是荒島本身，而是快要獲救時的急躁。",
  },

  ending_island_ruler: {
    isEnding: true,
    endingTitle: "結局：重建家園，島嶼新王",
    description:
      "你在漁村遺跡中找到了前人留下的漁網、工具，甚至還有一艘修補過就能下水的小船。但比起急著離開，你發現這片遺跡稍加整理，其實足以讓人安穩地生活下去。\n\n" +
      "你花了數月時間重建屋舍、馴養島上的野雞、開墾出一片菜園。這座島從此有了新的名字，而你，就是它的第一任「島主」——獲救與否，已經不再是你唯一在乎的事。",
  },
};

const START_NODE_ID = "start";

// ---------------- DOM 參照 ----------------
const storyCardEl = document.getElementById("storyCard");
const chapterTagEl = document.getElementById("chapterTag");
const endingTitleEl = document.getElementById("endingTitle");
const storyTextEl = document.getElementById("storyText");
const choicesEl = document.getElementById("choices");
const restartBtnEl = document.getElementById("restartBtn");
const progressHintEl = document.getElementById("progressHint");

let currentNodeId = START_NODE_ID;
// 避免使用者在淡出過場的短暫期間內連續狂點，造成畫面錯亂
let isTransitioning = false;

function renderNode(nodeId) {
  const node = STORY[nodeId];
  if (!node) {
    // 防呆：資料設定錯誤時，不讓畫面卡死，也絕不能再呼叫 renderNode 自己（避免無限遞迴）
    console.error(`找不到節點 "${nodeId}"，故事資料可能已損毀，顯示錯誤畫面。`);

    if (chapterTagEl) chapterTagEl.hidden = true;
    if (endingTitleEl) endingTitleEl.hidden = true;
    if (storyTextEl) {
      storyTextEl.textContent =
        "發生錯誤，找不到對應的故事節點。請重新整理頁面再試一次。";
    }
    if (choicesEl) {
      choicesEl.hidden = true;
      choicesEl.innerHTML = "";
    }
    if (restartBtnEl) restartBtnEl.hidden = false;
    if (progressHintEl) {
      progressHintEl.textContent = "資料異常，請重新整理頁面。";
    }
    return;
  }

  // 章節標籤
  if (node.chapter) {
    chapterTagEl.textContent = node.chapter;
    chapterTagEl.hidden = false;
  } else {
    chapterTagEl.hidden = true;
  }

  // 結局標題
  if (node.isEnding) {
    endingTitleEl.textContent = node.endingTitle || "結局";
    endingTitleEl.hidden = false;
  } else {
    endingTitleEl.hidden = true;
  }

  // 敘事文字
  storyTextEl.textContent = node.description;

  // 選項按鈕
  choicesEl.innerHTML = "";
  if (node.isEnding) {
    choicesEl.hidden = true;
    restartBtnEl.hidden = false;
  } else {
    choicesEl.hidden = false;
    restartBtnEl.hidden = true;

    (node.choices || []).forEach((choice) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-btn";
      btn.innerHTML = `<span class="choice-arrow">➜</span><span>${choice.text}</span>`;
      btn.addEventListener("click", () => goToNode(choice.next));
      choicesEl.appendChild(btn);
    });
  }

  progressHintEl.textContent = node.isEnding
    ? "故事在這裡告一段落——想不想試試別的選擇？"
    : "跟著直覺走，每個選擇都會改變你的命運……";
}

function goToNode(nextNodeId) {
  if (isTransitioning) return;
  if (!STORY[nextNodeId]) {
    console.error(`選項指向未知節點 "${nextNodeId}"，已忽略此次點擊。`);
    return;
  }

  isTransitioning = true;
  storyCardEl.classList.add("is-transitioning");

  window.setTimeout(() => {
    currentNodeId = nextNodeId;
    renderNode(currentNodeId);
    storyCardEl.classList.remove("is-transitioning");
    isTransitioning = false;
  }, 260);
}

function restartStory() {
  goToNode(START_NODE_ID);
}

restartBtnEl.addEventListener("click", restartStory);

// ---------------- 初始化 ----------------
renderNode(currentNodeId);
