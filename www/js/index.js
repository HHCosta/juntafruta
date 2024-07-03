document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);

    startAppMenu();
    startModalColeta();
}


function startAppMenu()
{
    $('#appMenu').sidenav();
}

function startModalColeta()
{
    $('#modalColeta').modal();
    $('#btnColeta').on('click', function() {
        $('#modalColeta').modal('open');
    });
}
