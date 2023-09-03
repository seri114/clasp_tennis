interface EventInfo {
    title: string
};
interface ResultInterface {
    info: string,
    warn: string,
}

function doGet(e: any) {
    const template = HtmlService.createTemplateFromFile('index');
    template.activeUser = Session.getActiveUser();
    return template.evaluate().setTitle("テニス予定追加").addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getRecentEvents(): GoogleAppsScript.Calendar.CalendarEvent[] {
    var today = new Date();
    var oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
    var events = CalendarApp.getDefaultCalendar().getEvents(oneMonthAgo, today);
    return events;
}

function getTodayTennisEvents(): GoogleAppsScript.Calendar.CalendarEvent[] {
    var date = new Date();
    var events = CalendarApp.getDefaultCalendar().getEventsForDay(date);
    var tennisEvents = events.filter((event) =>
        event.getTitle().indexOf("テニス") !== -1
    );
    return tennisEvents;
}

function getTodayTennisEventsInfo(): EventInfo[] {
    return getTodayTennisEvents().map((event) => ({ title: event.getTitle() }))
}

function removeTodayTennis(): string {
    const events = getTodayTennisEvents();
    var [, event] = getLatestTennisEvent(events);
    if (event) {
        const title = event.getTitle()
        event.deleteEvent();
        return title;
    }
    return "";
}

function getTennisNumber(event: GoogleAppsScript.Calendar.CalendarEvent): number | undefined {
    var title = event.getTitle();
    if (title.match(/^テニス\s*(\d+)$/)) {
        var n = parseInt(RegExp.$1);
        return n;
    }
    return undefined;
}

function getLatestTennisEvent(events: GoogleAppsScript.Calendar.CalendarEvent[])
    : [number, GoogleAppsScript.Calendar.CalendarEvent | undefined] {
    // テニスXXの数字を取得
    var num = 0;
    var event: GoogleAppsScript.Calendar.CalendarEvent | undefined = undefined;
    for (var i = 0; i < events.length; i++) {
        const n = getTennisNumber(events[i]);
        if (n !== undefined) {
            if (n > num) {
                num = n;
                event = events[i]
            }
        }
    }
    return [num, event];
}

function addTennis(): ResultInterface {
    var events = getRecentEvents()

    // テニスXXの数字を取得
    var [num,] = getLatestTennisEvent(events);
    num++;

    // 新しい予定のタイトルを作成
    var title = "テニス" + num;

    // 予定を作成
    var startTime = new Date();
    startTime.setHours(8, 55, 0, 0);
    var endTime = new Date(startTime.getTime() + 85 * 60 * 1000);
    var event = CalendarApp.getDefaultCalendar().createEvent(title, startTime, endTime);

    // 振り込み必要？
    var needBankTransfer = false;
    if (num % 8 == 7) {
        needBankTransfer = true;
    }
    return {
        info: `${event.getTitle()} を追加しました。`,
        warn: needBankTransfer ? "振り込みが必要です。" : ""
    }
}
