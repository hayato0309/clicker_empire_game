const config = {
    pageContainer: document.getElementById("page-container"),
}

class Player {
    constructor(name, age, day, burger, money, items, totalEtfStock) {
        this.name = name;
        this.age = age;
        this.day = day;
        this.burger = burger;
        this.profitPerFlip = 25;
        this.money = money;
        this.items = items;
        this.totalEtfStock = totalEtfStock;
    }

    countAge() {
        this.age++;
    }

    countDay() {
        this.day++;
    }

    countBurger() {
        this.burger++;
    }

    earnMoney(profit) {
        this.money += profit;
    }

    calcProfitPerClick() {
        let flipMachine = this.items["flipMachine"];
        return this.profitPerFlip + (flipMachine.profit * flipMachine.currentAmount);
    }

    calcProfitPerSec(player) {
        let items = player.items;
        let profitPerSec = 0;
        for (let key in items) {
            if (items[key].earnType === "sec" && items[key].profitUnit === "¥") {
                profitPerSec += items[key].currentAmount * items[key].profit;
            }
        }
        profitPerSec += player.totalEtfStock * (items["etfStock"].profit / 100);
        profitPerSec += items["etfBonds"].currentAmount * items["etfBonds"].price * (items["etfBonds"].profit / 100);

        return profitPerSec;
    }

    payMoney(price) {
        this.money -= price;
    }

    countItem(item, inputItemNum) {
        this.items[item].currentAmount += inputItemNum;
    }

    countTotalEtfStock(inputItemNum) {
        this.totalEtfStock += this.items["etfStock"].price * inputItemNum;
    }

    calcPurchaseTotal(item, inputItemNum) {
        return this.items[item].price * inputItemNum;
    }

    updateEtfStockPrice() {
        // ETF Stockは購入する度に１０％購入額が増加する
        this.items["etfStock"].price *= 1.1;
    }
}

class Item {
    constructor(name, type, currentAmount, maxAmount, price, profit, profitUnit, earnType, imgUrl) {
        this.name = name;
        this.type = type;
        this.currentAmount = currentAmount; // 現在の個数
        this.maxAmount = maxAmount; // 最大個数
        this.price = price;
        this.profit = profit;
        this.profitUnit = profitUnit; // 利益の単位が¥か%か
        this.earnType = earnType; // 利益発生がclick毎かsec（秒）毎か
        this.imgUrl = imgUrl;
    }
}

class View {
    static createInitialPage() {
        let container = document.createElement("div");
        container.classList.add("p-4", "bg-white", "border-radius-4");
        container.setAttribute("id", "initialPage");
        container.innerHTML =
            `
            <h3 class="mb-4">Clicker Empire Game</h3>
            <form class="mb-0">
                <div class="form-group mb-4">
                    <input id="playerNameInput" class="form-control" placeholder="Your name">
                </div>
                <div class="d-flex justify-content-between">
                    <div class="col-6 pl-0">
                        <button type="submit" class="col-12 btn btn-primary" id="newButton">New</button>
                    </div>
                    <div class="col-6 pr-0">
                        <button class="col-12 btn btn-primary" id="loginButton">Login</button>
                    </div>
                </div>
            </form>
        `;

        let newButton = container.querySelectorAll("#newButton")[0];
        newButton.addEventListener("click", function (event) {
            let playerName = container.querySelectorAll("#playerNameInput")[0].value;
            event.preventDefault();
            event.stopPropagation();
            Controller.startWithNewPlayer(playerName);
        }, { passive: false });

        let loginButton = container.querySelectorAll("#loginButton")[0];
        loginButton.addEventListener("click", function (event) {
            let playerName = container.querySelectorAll("#playerNameInput")[0].value;
            event.preventDefault();
            event.stopPropagation();
            Controller.continueWithSavedPlayer(playerName);
        }, { passive: false });

        return container;
    }

    static createMainPage(player) {
        config.pageContainer.innerHTML = "";
        let container = document.createElement("div");
        container.classList.add("d-flex", "col-10", "vh-75", "p-4", "bg-light", "border-radius-4", "text-dark", "position-relative")
        container.setAttribute("id", "mainPage");
        container.innerHTML =
            `
            <div class="col-4 h-100 px-0" id="leftSideSection">
            </div>
            <div class="col-8 d-flex flex-column justify-content-between h-100 px-0" id="rightSideSection">
            </div>
        `;

        // ゲームのデータを管理するボタン（リセット・保存）を作成
        let gameDataControlButtonsContainer = document.createElement("div");
        gameDataControlButtonsContainer.classList.add("fixed-game-data-control-btns-position");
        gameDataControlButtonsContainer.innerHTML =
            `
            <button class="btn btn-outline-light" id="resetDataButton">
                <i class="fas fa-undo text-pale-blue"></i>
            </button>
            <button class="btn btn-outline-light" id="saveDataButton">
                <i class="fas fa-save text-pale-blue"></i>
            </button>
        `;

        let deleteDataButton = gameDataControlButtonsContainer.querySelectorAll("#resetDataButton")[0];
        deleteDataButton.addEventListener("click", function () {
            Controller.resetData(player);
        });

        let saveDataButton = gameDataControlButtonsContainer.querySelectorAll("#saveDataButton")[0];
        saveDataButton.addEventListener("click", function () {
            Controller.saveData(player);
        });

        container.append(gameDataControlButtonsContainer);

        return container;
    }

    static createLeftSideSection(player) {
        let container = document.createElement("div");
        container.classList.add("d-flex", "flex-column", "justify-content-between", "h-100", "box-shadow-pale", "border-radius-4", "p-3", "mr-4");
        container.setAttribute("id", "leftSideSection");
        container.innerHTML =
            `
            <div class="text-center py-2">
                <p class="h5" id="playersBurger">${player.burger} Burgers</p>
                <p class="mb-0">one click ¥ ${player.profitPerFlip}</p>
            </div>
            <div class="d-flex justify-content-center align-items-center h-100">
                <img class="item-img img-hover-filter pointer" id="burger" src="https://cdn.pixabay.com/photo/2014/04/02/17/00/burger-307648_960_720.png">
            </div>
        `;

        let burger = container.querySelectorAll("#burger")[0];
        burger.addEventListener("click", function () {
            Controller.flipBurger(player);
        });

        return container;
    }

    static createInfoSection(player) {
        let container = document.createElement("div");
        container.classList.add("text-center", "box-shadow-pale", "border-radius-4", "mb-4");
        container.setAttribute("id", "leftInfoSection");
        container.innerHTML =
            `
            <div class="d-flex">
                <div class="col-6 border-pale-white-thin-right border-pale-white-thin-bottom py-3">
                    <p class="mb-0" id="playersName">${player.name}</p>
                </div>
                <div class="col-6 border-pale-white-thin-bottom py-3">
                    <p class="mb-0" id="playersAge">${player.age} years old</p>
                </div>
            </div>
            <div class="d-flex">
                <div class="col-6 border-pale-white-thin-right py-3">
                    <p class="mb-0" id="playersDay">${player.day} days</p>
                </div>
                <div class="col-6 py-3">
                    <p class="mb-0" id="playersMoney">¥ ${player.money}</p>
                </div>
            </div>
        `;

        return container;
    }

    static createItemListSection(player) {
        let container = document.createElement("div");
        container.classList.add("overflow-auto", "box-shadow-pale", "border-radius-4", "inner-shadow");
        container.setAttribute("id", "itemListSection");

        for (let key in player.items) {
            let itemBox = document.createElement("div");
            itemBox.classList.add("d-flex", "align-items-center", "border-pale-white-thin-bottom", "p-3", "item-box-focus", "pointer", "item-box");
            itemBox.setAttribute("id", key);
            itemBox.setAttribute("data-item", key);
            itemBox.innerHTML =
                `
                <div class="col-3">
                    <img src="${player.items[key].imgUrl}" class="item-img">
                </div>
                <div class="col-9">
                    <div class="d-flex justify-content-between">
                        <p class="h5 mr-2">${player.items[key].name}</p>
                        <p id="currentAmount" class="h5">${player.items[key].currentAmount}</p>
                    </div>
                    <div class="d-flex justify-content-between">
                        <p class="mb-0 mr-1">¥ ${player.items[key].price}</p>
                        <p class="mb-0 text-success">
                            ${player.items[key].profitUnit === "¥" ? "¥ " : ""}${player.items[key].profit}${player.items[key].profitUnit === "¥" ? "" : " %"} / ${player.items[key].earnType}
                        </p>
                    </div>
                </div>
            `;
            container.append(itemBox);
        }

        let itemBoxes = container.querySelectorAll(".item-box");
        for (let i = 0; i < itemBoxes.length; i++) {
            itemBoxes[i].addEventListener("click", function () {
                let item = itemBoxes[i].getAttribute("data-item");
                Controller.openPurchaseItemPage(player, item);
            });
        }

        return container;
    }

    static createPurchaseItemPage(player, item) {
        let selectedItem = player.items[item];
        let container = document.createElement("div");
        container.classList.add("p-4");
        container.innerHTML =
            `
            <div class="d-flex mb-3">
                <div class="col-7 d-flex align-items-center px-0">
                    <div>
                        <p class="h5">${selectedItem.name}</p>
                        <p>Max purchases: ${selectedItem.maxAmount}</p>
                        <p>Price: ${selectedItem.price}</p>
                        <p>Get: ${selectedItem.profit} / ${selectedItem.earnType}</p>
                    </div>
                </div>
                <div class="col-5 d-flex align-items-center px-0">
                    <img class="item-img" src="${selectedItem.imgUrl}">
                </div>
            </div>
            <div>
                <form class="mb-0">
                    <div class="form-group">
                        <label>How many would you like to buy?</label>
                        <input class="form-control w-100 px-2 py-1 mb-1" type="number" placeholder="0" min="0" id="itemNumInput">
                        <p class="text-right" id="purchaseTotal">Total: ¥ 0<p>
                    </div>
                    <div class="d-flex justify-content-between">
                        <div class="col-6 pl-0">
                            <button class="btn btn-outline-primary btn-sm btn-block" id="goBack">Go Back</button>
                        </div>
                        <div class="col-6 pr-0">
                            <button class="btn btn-primary btn-sm btn-block" id="purchase">Purchase</button>
                        </div>
                    </div>
                </form>
            </div>
            <div>
            </div>
        `;

        let itemNumInput = container.querySelectorAll("#itemNumInput")[0];
        itemNumInput.addEventListener("input", function () {
            let inputItemNum = itemNumInput.value;
            Controller.displayPurchaseTotal(player, item, inputItemNum);
        });

        let purchaseButton = container.querySelectorAll("#purchase")[0];
        purchaseButton.addEventListener("click", function () {
            let inputItemNum = itemNumInput.value;
            Controller.purchaseItem(player, item, inputItemNum);
        });

        let goBackButton = container.querySelectorAll("#goBack")[0];
        goBackButton.addEventListener("click", function () {
            Controller.goBack(player);
        });

        return container;
    }
}

class Controller {
    // dayのカウントの開始・停止に使用するID
    intervalId;

    static saveData(player) {
        // dataを保存
        let playerData = JSON.stringify(player);
        localStorage.setItem(player.name, playerData);

        alert(`Saved your data. Please put the same name "${player.name}" when you login.`);

        // 毎秒実行しているメソッドを止める
        Controller.stopCountingDay();

        // ページ切り替え
        config.pageContainer.innerHTML = "";
        config.pageContainer.append(View.createInitialPage());
    }

    static resetData(player) {
        if (confirm("Are you sure you want to delete all data?")) {
            localStorage.removeItem(player.name);
            // nameはそのままでPlayerインスタンスを作り直す
            player = Controller.createNewPlayer(player.name);
            // 作り直したPlayerを基にページを作り直す
            config.pageContainer.innerHTML = "";
            config.pageContainer.append(Controller.createMainView(player));
            // 作り直したPlayerを基に毎秒実行するメソッドをリスタートする
            Controller.stopCountingDay();
            Controller.startCountingDay(player);
        }
    }

    static getPlayerData(playerName) {
        return JSON.parse(localStorage.getItem(playerName));
    }

    static startGame() {
        let container = View.createInitialPage();
        config.pageContainer.append(container);
    }

    static checkEmptyNameInput() {
        if (inputPlayerName === "") {
            alert("Please input your name.");
            return false;
        }
    }

    static startWithNewPlayer(inputPlayerName) {
        if (inputPlayerName === "") {
            alert("Please input your name.");
            return false;
        }

        let playerDataObject = Controller.getPlayerData(inputPlayerName);
        if (playerDataObject !== null) {
            alert(`The name "${inputPlayerName}" is already taken. Please use different one.`);
            return false;
        }

        let player = Controller.createNewPlayer(inputPlayerName);
        config.pageContainer.append(Controller.createMainView(player));
        Controller.startCountingDay(player);
    }

    static continueWithSavedPlayer(inputPlayerName) {
        let playerDataObject = Controller.getPlayerData(inputPlayerName);
        if (playerDataObject === null) {
            alert(`There is no such player "${inputPlayerName}".`);
            return false;
        }

        let player = new Player(playerDataObject.name, playerDataObject.age, playerDataObject.day, playerDataObject.burger, playerDataObject.money, playerDataObject.items, playerDataObject.totalEtfStock);

        config.pageContainer.append(Controller.createMainView(player));
        Controller.startCountingDay(player);
    }

    static createNewPlayer(name) {
        let playerName = name;
        const startAge = 20;
        const startDay = 0;
        const startBurger = 0;
        const startMoney = 50000;
        let items = Controller.createItems();
        let totalEtfStock = 0;
        let player = new Player(playerName, startAge, startDay, startBurger, startMoney, items, totalEtfStock);

        return player;
    }

    static createItems() {
        let itemsHashmap = {
            "flipMachine": new Item("Flip Machine", "ability", 0, 500, 15000, 25, "¥", "click", "https://cdn.pixabay.com/photo/2019/06/30/20/09/grill-4308709_960_720.png"),
            "etfStock": new Item("ETF Stock", "investment", 0, -1, 300000, 0.1, "%", "sec", "https://cdn.pixabay.com/photo/2016/03/31/20/51/chart-1296049_960_720.png"),
            "etfBonds": new Item("ETF Bonds", "investment", 0, -1, 300000, 0.1, "%", "sec", "https://cdn.pixabay.com/photo/2016/03/31/20/51/chart-1296049_960_720.png"),
            "lemonadeStand": new Item("Lemonade Stand", "realEstate", 0, 1000, 30000, 30, "¥", "sec", "https://cdn.pixabay.com/photo/2012/04/15/20/36/juice-35236_960_720.png"),
            "iceCreamTruck": new Item("Ice Cream Truck", "realEstate", 0, 500, 100000, 120, "¥", "sec", "https://cdn.pixabay.com/photo/2020/01/30/12/37/ice-cream-4805333_960_720.png"),
            "house": new Item("House", "realEstate", 0, 100, 20000000, 32000, "¥", "sec", "https://cdn.pixabay.com/photo/2016/03/31/18/42/home-1294564_960_720.png"),
            "townHouse": new Item("Town House", "realEstate", 0, 100, 40000000, 64000, "¥", "sec", "https://cdn.pixabay.com/photo/2019/06/15/22/30/modern-house-4276598_960_720.png"),
            "mansion": new Item("Mansion", "realEstate", 0, 20, 250000000, 500000, "¥", "sec", "https://cdn.pixabay.com/photo/2017/10/30/20/52/condominium-2903520_960_720.png"),
            "industrialSpace": new Item("Industrial Space", "realEstate", 0, 10, 1000000000, 2200000, "¥", "sec", "https://cdn.pixabay.com/photo/2012/05/07/17/35/factory-48781_960_720.png"),
            "hotelSkyScraper": new Item("Hotel SkyScraper", "realEstate", 0, 5, 10000000000, 25000000, "¥", "sec", "https://cdn.pixabay.com/photo/2012/05/07/18/03/skyscrapers-48853_960_720.png"),
            "bulletSpeedSkyRailway": new Item("Bullet-Speed Sky Railway", "realEstate", 0, 1, 10000000000000, 30000000000, "¥", "sec", "https://cdn.pixabay.com/photo/2013/07/13/10/21/train-157027_960_720.png")
        };

        return itemsHashmap;
    }

    static createMainView(player) {
        let mainPage = View.createMainPage(player);

        let leftSideSection = mainPage.querySelectorAll("#leftSideSection")[0];
        let leftSideSectionContent = View.createLeftSideSection(player);
        leftSideSection.append(leftSideSectionContent);

        let rightSideSection = mainPage.querySelectorAll("#rightSideSection")[0];
        rightSideSection.append(View.createInfoSection(player));
        rightSideSection.append(View.createItemListSection(player));

        return mainPage;
    }

    static openPurchaseItemPage(player, item) {
        let itemListSection = document.querySelectorAll("#itemListSection")[0];
        itemListSection.innerHTML = "";
        itemListSection.append(View.createPurchaseItemPage(player, item));
    }

    static startCountingDay(player) {
        let intervalId = setInterval(function () {
            player.countDay();
            let dayContainer = document.querySelectorAll("#playersDay")[0];
            dayContainer.innerHTML = `${player.day} days`;

            if (player.day % 365 === 0) Controller.countAge(player);

            player.earnMoney(player.calcProfitPerSec(player));
            let moneyContainer = document.querySelectorAll("#playersMoney")[0];
            moneyContainer.innerHTML = `¥ ${player.money}`;
        }, 1000);

        Controller.intervalId = intervalId;
    }

    static stopCountingDay() {
        clearInterval(Controller.intervalId);
    }

    static countAge(player) {
        player.countAge();
        let ageContainer = document.querySelectorAll("#playersAge")[0];
        ageContainer.innerHTML = `${player.age} years old`;
    }

    static flipBurger(player) {
        let playersBurger = document.querySelectorAll("#playersBurger")[0];
        let playersMoney = document.querySelectorAll("#playersMoney")[0];

        player.countBurger();
        let profitPerClick = player.calcProfitPerClick();
        player.earnMoney(profitPerClick);

        Controller.playSoundEffect("sizzle");

        playersBurger.innerHTML = `${player.burger} Burgers`;
        playersMoney.innerHTML = `¥ ${player.money}`;
    }

    static playSoundEffect(soundEffectName) {
        let soundEffect = new Audio();
        soundEffect.preload = "auto";
        soundEffect.src = `audio/${soundEffectName}.wav`;
        soundEffect.play();
    }

    static displayPurchaseTotal(player, item, inputItemNum) {
        let purchaseTotalContainer = document.querySelectorAll("#purchaseTotal")[0];
        let purchaseTotal = player.calcPurchaseTotal(item, inputItemNum);
        purchaseTotalContainer.innerHTML = `¥ ${purchaseTotal}`;
    }

    static purchaseItem(player, item, inputItemNum) {
        // 入力値が０以下の場合
        if (inputItemNum <= 0) {
            alert("This is an invalid input. Please input 1 or more.");
            Controller.goBack(player);
            return false;
        }
        // 入力値がアイテムの最大数を超える場合
        // 無限に購入できるアイテムは最大数-1でインスタンス生成しているので、-1の場合はアラートを表示しない
        let maxAmount = player.items[item].maxAmount;
        if (maxAmount !== -1 && inputItemNum > maxAmount) {
            alert(`You can buy this item up to ${maxAmount}.`);
            Controller.goBack(player);
            return false;
        }
        // 入力値に基づいて計算した合計金額が手持ちの金額を超える場合
        let purchaseTotal = player.calcPurchaseTotal(item, parseInt(inputItemNum));
        if (player.money < purchaseTotal) {
            alert("You don't have enough money.");
            Controller.goBack(player);
            return false;
        }

        player.countItem(item, parseInt(inputItemNum));
        player.payMoney(purchaseTotal);

        if (item === "etfStock") {
            player.countTotalEtfStock(inputItemNum);
            player.updateEtfStockPrice();
        }

        Controller.goBack(player);
    }

    static goBack(player) {
        let rightSideSection = document.querySelectorAll("#rightSideSection")[0];
        let itemListSection = document.querySelectorAll("#itemListSection")[0];
        rightSideSection.removeChild(itemListSection);
        rightSideSection.append(View.createItemListSection(player));
    }
}

Controller.startGame();