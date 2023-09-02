function getRecentEvents() {
    var today = new Date();
    var oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
    var events = CalendarApp.getDefaultCalendar().getEvents(oneMonthAgo, today);
    return events;
}

function doGet(e: any) {
    const template = HtmlService.createTemplateFromFile('index');
    template.activeUser = Session.getActiveUser();
    return template.evaluate().setTitle("テニス予定追加").addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getTodayTennisEvent(){
    var date = new Date();
    var events = CalendarApp.getDefaultCalendar().getEventsForDay(date);
    var event = events.find(function (event) {
        return event.getTitle().indexOf("テニス") !== -1;
    });
    return event;
}
function isTennisAdded() {
    return !!getTodayTennisEvent();
}

function removeTodayTennis(){
    const event = getTodayTennisEvent();
    if(event){
        event.deleteEvent();
        return true;
    }
    return false;
}

function addTennis() {
    var events = getRecentEvents()

    // テニスXXの数字を取得
    var num = 0;
    for (var i = 0; i < events.length; i++) {
        var title = events[i].getTitle();
        if (title.match(/^テニス\s*(\d+)$/)) {
            var n = parseInt(RegExp.$1);
            if (n > num) {
                num = n;
            }
        }
    }
    num++;

    // 新しい予定のタイトルを作成
    var title = "テニス" + num;

    // 土曜日は「本村小」、日曜日は「南山小」に設定
    var dayOfWeek = new Date().getDay();
    var location = "";
    if (dayOfWeek == 6) {
        location = "本村小";
    } else if (dayOfWeek == 0) {
        location = "南山小";
    } else {
        // if(!yesno('土日以外ですが、予定を追加しますか？')){
        //   return createAlert('予定の追加をスキップしました。')
        // }
        location = "南山小";
    }

    var hasTennisEvent = isTennisAdded();
    if (hasTennisEvent) {
        return 'すでに予定を追加済です。';
    }

    // 予定を作成
    var startTime = new Date();
    startTime.setHours(8, 55, 0, 0);
    var endTime = new Date(startTime.getTime() + 85 * 60 * 1000);
    var event = CalendarApp.getDefaultCalendar().createEvent(title, startTime, endTime, { location: location });

    // ポップアップ表示の必要性を判定し、Webページを生成する
    var needBankTransfer = false;
    if (num % 8 == 7) {
        needBankTransfer = true;
    }
    // var html = "<html><body>新しい予定が追加されました<br>" + event.getTitle() + "<br>" + event.getStartTime() + "<br>" + event.getLocation() + "<br>" + popup + "</body></html>";
    // return HtmlService.createHtmlOutput(html);
    var html = `${needBankTransfer ? "振り込みが必要です!!!" : ""}新しい予定が追加されました。 ${event.getTitle()} ${event.getLocation()}`;
    return html;
}
