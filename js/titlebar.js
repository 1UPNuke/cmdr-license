window.$ = window.jQuery = module.exports;
$(document).ready(async function(){
    const { ipcRenderer } = require('electron');

    document.getElementById("min-btn").addEventListener("click", function (e) {
        ipcRenderer.sendSync('minimize-window');
    });

    document.getElementById("max-btn").addEventListener("click", function (e) {
        ipcRenderer.sendSync('maximize-window');
    });

    document.getElementById("close-btn").addEventListener("click", function (e) {
        ipcRenderer.sendSync('close-window');
    }); 

});