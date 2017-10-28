console.log('initializing fio extension');
chrome.extension.sendRequest("show_page_action");

const FIO_COLOR = '#00458A';
const FIO_DARK_BLUE_COLOR = '#084694';
const FIO_BLUE_COLOR = '#C0E0F0';
const FIO_LEFT_MENU_COLOR = '#C0E0F0';

$("#pocet, #cena, #menaId").change(function () {
    calculateFinalPrice();
});

function improveDesign() {
    updateTopMenu();
    updateLeftMenu();
    moveTradesForm();
    moveOrdersForm();

    addFlags();
    $("input, select").css("font-size", "13px");
}

function addFunctionality() {
    if (isPage("e-pokyn_univ.cgi")) {
        var tickerName = $("#ceninaSymbol").val();

        // e-find_cp.cgi
        $.get("https://www.fio.cz/e-broker/e-find_cp.cgi?search_all=1&select_scriptname=e-cp.cgi&select_menu=0&Find_Ticker=" + tickerName,
            function(data) {
                appendToBody(data, "#vyhledavaniSimpleTable");
            })
        .then(function (tickerName) {
            var tickerId = getTickerId(tickerName);

            // e-cp.cgi
            return $.get("https://www.fio.cz/e-broker/e-cp.cgi?TICKERID1=" + tickerId,
                function(data) {
                    appendToBody(data, "#graph_cp_table1");
                })
        })
        .then(function() {
            // e-penize.cgi
            return $.get("https://www.fio.cz/e-broker/e-penize.cgi",
                function (data) {
                    appendToBody(data, "#penize_kurzy_men_table");
                })
        })
        .done(function () {
            // Get ticker currency
            var tickerCurrency = getTickerCurrency();
            var tickerDateAndPrice = getTickerDateAndPrice(tickerName);

            // Add current price
            $("<div id='tickerDateAndPrice' style='background-color: yellow;'>" + tickerDateAndPrice + " (" + tickerCurrency + ")</div>").insertAfter("#cena");

            calculateFinalPrice();

            // Clean up
            $("#vyhledavaniSimpleTable").hide();
            $("#graph_cp_table1").hide();
            $("#penize_kurzy_men_table").hide();
        });
    }
}

function calculateFinalPrice() {
    $("#exchangeRate").remove();
    $("#finalPrice").remove();

    var count = parseInt($("#pocet").val());
    var price = parseFloat($("#cena").val().replace(',', '.'));
    if (isNaN(price)) {
        var lastPrice = $("#tickerDateAndPrice").text().split("-")[1].split("(")[0];
        var price = parseFloat(lastPrice.replace(',', '.'))
    }
    var exchangeRate = 1; // TODO

    var selectedCurrency = $("#vyporadaniUcty #menaId option:selected").text();
    var tickerCurrency = getTickerCurrency();
    if (selectedCurrency !== tickerCurrency) {
        exchangeRate = getExchangeRate(selectedCurrency, tickerCurrency);
        $("<div id='exchangeRate' style='background-color: yellow;'>≈ " + tickerCurrency + "/" + selectedCurrency + " = " + exchangeRate + "</div>").insertAfter("#menaId");
    }

    var result = count * price * exchangeRate;
    $("<tr id='finalPrice' style='background-color: yellow;'><td><label>Total</label>≈ " + result.toFixed(4) + " (" + selectedCurrency + ") </td></tr>").insertAfter($("#oznaceni").closest("tr"));
}

function appendToBody(html, selector) {
    $("body").append($(html).find(selector));
}

function isPage(pageName) {
    return window.location.href.indexOf(pageName) > -1;
}

function getTickerId(tickerName) {
    var $table = $("#vyhledavaniSimpleTable");

    var columnTh = $table.find("th:contains('Symbol')");
    var columnIndex = columnTh.index() + 1;
    var $columnId = $($table.find('tr td:nth-child(' + columnIndex + ')').parent().find("td")[0]);

    return $columnId.text();
}

function getTickerCurrency() {
    var regExp = /\(([^)]+)\)/;
    var matches = regExp.exec($(".noPrice label").text());

    // matches[1] contains the value between the parentheses
    return matches[1];
}

function getExchangeRate(selectedCurrency, tickerCurrency) {
    // TODO muze byt i obracene !!!
    var $row = getRowWithText("#penize_kurzy_men_table", tickerCurrency + "/" + selectedCurrency);
    //$($($("#penize_kurzy_men_table tr")[3]).find("td")[2]).text()
    return parseFloat($($row.find("td")[2]).text().replace(',', '.'));
}

function getRowWithText(tableSelector, text) {
    return $(tableSelector + " td").filter(function () {
        return $(this).text() == text;
    }).closest("tr");
}

function getTickerDateAndPrice(tickerName) {
    var tickerId = getTickerId(tickerName);
    var $table = $("#graph_cp_table1");

    var tickerDateAndPrice = $($table.find("tr.e td")[0]);
    return tickerDateAndPrice.text();
}

function updateTopMenu() {
    var $header = $("#overhead");
    $header.empty();
    $header.css("background", "url(https://www.fio.cz/gfx/logo3.gif) -5px 0 no-repeat")
    $header.css("background-color", "#f3f6f9")

    var menuHeight = "30px";
    var textHeight = "13px";

    var $menu = $("#main-menu");
    $menu.height(menuHeight);
    $menu.css("background-color", "white")
    $menu.find("a").css("color", FIO_DARK_BLUE_COLOR)
    $menu.css("font-size", textHeight);
    $menu.css("padding", "0px");

    $(".top-menu-item").css("color", "white");
    $(".top-menu-item-negative").css("color", "red"); // TODO find a better color

    var $menuItems = $menu.find(".menu-item,.menu-item-selected");
    $menuItems.height(menuHeight);
    $menuItems.css("padding-top", "4px");
    $menuItems.css("border", "none");
    $menuItems.find("img").remove();

    var $subMenuA1 = $("#a1");
    var $subMenuA2 = $("#a2");
    var $subMenuA3 = $("#a3");
    var $subMenuA4 = $("#a4");
    var $subMenuA5 = $("#a5");
    var $subMenuA6 = $("#a6");

    updateSubMenu($subMenuA1);
    updateSubMenu($subMenuA2);
    updateSubMenu($subMenuA3);
    updateSubMenu($subMenuA4);
    updateSubMenu($subMenuA5);
    updateSubMenu($subMenuA6);
}

function updateSubMenu($subMenu) {
    $subMenu.css("margin-left", "-10px");
    $subMenu.css("margin-top", "10px")

    var $pars = $subMenu.find("p");
    $pars.css("padding", "3px")

    var $links = $subMenu.find("a.smt");
    $links.removeClass("smt");
}

function updateLeftMenu() {
    var $mainStyleLeft = $(".main-style-left");
    var $mainLeft = $("#main-left");
    var $mainLeftIn = $("#main-left-in");

    $mainStyleLeft.width("200px");
    $mainLeft.width("200px");

    $mainStyleLeft.css("background-color", FIO_LEFT_MENU_COLOR);
    $mainLeft.css("background-color", FIO_LEFT_MENU_COLOR);
    $mainLeftIn.css("background-color", FIO_LEFT_MENU_COLOR);

    $mainLeftIn.css("font-size", "13px");
}

function addFlags() {
    var $langSwitch = $(".lang-switch");
    var key = "#country#";

    // https://www.countryflags.com/en/icons-overview/
    var img = "<img src='https://cdn.countryflags.com/thumbs/" + key + "/flag-400.png' style='width: 32px; height: 20px;'>";

    // https://cdn.countryflags.com/thumbs/czech-republic/flag-400.png
    $("a[href='?lng=1']").empty().append(img.replace(key, "czech-republic"));

    // https://cdn.countryflags.com/thumbs/united-states-of-america/flag-400.png
    $("a[href='?lng=2']").empty().append(img.replace(key, "united-states-of-america"));

    // https://cdn.countryflags.com/thumbs/hungary/flag-400.png
    $("a[href='?lng=3']").empty().append(img.replace(key, "hungary"));

    // https://cdn.countryflags.com/thumbs/poland/flag-400.png
    $("a[href='?lng=4']").empty().append(img.replace(key, "poland"));

    // https://cdn.countryflags.com/thumbs/slovakia/flag-400.png
    $("a[href='?lng=6']").empty().append(img.replace(key, "slovakia"));
}

function moveTradesForm() {
    moveForm("e-obchody.cgi");
}

function moveOrdersForm(action) {
    moveForm("e-pokyny.cgi");
}

function moveForm(action) {
    var $form = $("form[action='" + action + "']");
    $form.css("background-color", '#C0E0F0');
    $form.find("br").remove();
    $form.detach().insertAfter(".td-in-right .f-left");
    $("<br>").insertAfter(".td-in-right .f-left");
}

$(document).ready(function(){
    window.extras._load().then(() => {
        improveDesign();
        addFunctionality();
    });
});
