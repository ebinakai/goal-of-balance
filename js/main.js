'use strict';
let balance = 0;
let last_id = 0;
const storage = localStorage;
const body_offset = document.body.offsetHeight - 100;

// ローカルストレージの読み込み
let histories = storage.getItem('histories');
if ( histories === null )  histories = [];
else    histories = JSON.parse(histories);
let goal = Number( storage.getItem('goal') );
if ( [NaN, null, 0].includes(goal) ){
    goal = Number(window.prompt("set goal balance."));
    storage.setItem("goal", goal);
}

// 初期設定
document.querySelector(".base").textContent = ` / ${goal.toLocaleString()}円`;
document.querySelector('.control-panel input').focus();
reset_all();

// 初期化処理
function reset_all() {
    const pre_balance = balance;
    balance = 0;
    histories.forEach((history) => {
        add_table(history);
        balance += history["value"];
    });

    reload_balance(pre_balance, balance);
}

// "/"を押すとフォーカスが当たる
document.addEventListener("keyup", (e) => {
    if (e.key === "/") {
        document.querySelector('.control-panel input').focus();
    }
});

// 入金処理
document.querySelector(".submit").addEventListener("click", (e)=> {
    e.preventDefault();

    const value = document.querySelector(".control-panel input").value;

    document.querySelector(".control-panel input").value = "";
    if ( Number(value) === 0 ) return;

    const pre_balance = balance;
    balance += Number(value);
    
    reload_balance(pre_balance, balance);
    add_history(value);

    storage.setItem("histories", JSON.stringify(histories));
});

// 日時と金額をオブジェクトに追加
function add_history(value) {
    const now = new Date;
    const date = [];
    
    date.push(now.getFullYear());
    date.push(now.getMonth() + 1);
    date.push(now.getDate());

    const history = {
        date: date.join('/'),
        value: Number(value),
        id: last_id + 1
    };

    last_id ++;
    histories.push(history);
    add_table(history);
}

// 表に追加
function add_table(history) {
    const thElm = document.createElement("tr");
    const th_date = document.createElement('td');
    const th_value = document.createElement('td');

    th_date.textContent = history["date"];
    th_value.textContent = history["value"].toLocaleString() + "円";
    thElm.id = history["id"];
    last_id = Math.max(history["id"], last_id);

    thElm.appendChild(th_date);
    thElm.appendChild(th_value);
    thElm.addEventListener("dblclick", ()=> {
        thElm.remove();
        histories.forEach((history, idx) =>{
            if ( thElm.id == history["id"] ) {
                histories.splice(idx, 1);
            }
        });
        storage.setItem("histories", JSON.stringify(histories));
        balance -= history["value"];
        reload_balance(balance + history["value"], balance);
    });

    document.querySelector('.table tbody').prepend(thElm);
}

// すべてをリセット
document.querySelector("footer p").addEventListener("dblclick", () => {
    if (confirm('All Data is Deleted?')) {
        document.querySelector(".table tbody").textContent = "";
        storage.removeItem("histories");
        histories.length = 0;
        reset_all();
    }
});

// 金額表示の更新
function reload_balance(from, to) { 
    const intervalId = setInterval(() => {
        const remain = Math.max(goal - from, 0);
        const rate = Math.min(Math.floor(100 * from / goal), 100);
        let sign = 1;

        document.querySelector(".remain span").textContent = remain.toLocaleString();
        document.querySelector(".rate p").textContent = String(rate) + "%";
        document.querySelector(".balance").textContent = from.toLocaleString();
        document.querySelector(".level").style.height = `${body_offset * Math.min(from / goal, 1) + 100}px`;

        if ( from > to ) sign = -1;
        if (from === to) clearInterval(intervalId);

        from += Math.round( Math.sqrt( Math.abs( to - from ) ) ) * sign;

    }, 0);
}

$('#wave').wavify({
    height: 60,
    bones: 5,
    amplitude: 40,
    color: '#bd4949',
    speed: .25
});