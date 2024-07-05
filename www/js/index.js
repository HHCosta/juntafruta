document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);

    startAppMenu();
    startModalColeta();
    startMapa();
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
    
    $('#btnModalColetaCancelar').on('click', function(){
        $('#modalColeta').modal('close');
    });
}

function startMapa()
{ 
    var opcoes = {
        fullscreenControl:true,
        fullscreenControlOptions: {
            position:"topleft"
        }
    }
    var mapa=L.map("mapa",opcoes);
    mapa.setView([-23.572683, -46.625513], 18);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        maxZoom: 19
    }).addTo(mapa);
}
