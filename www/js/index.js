var userLat = null;
var userLng = null;
var mapa = null;
var pinIcon = null;

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);

    
    startAppMenu();
    startModalColeta();
    startMapa();
    starGeolocation();
}


function startAppMenu()
{
    $('#appMenu').sidenav();
}

function startModalColeta()
{
    $('#modalColeta').modal();
    $('#btnColeta').on('click', async function() {
        $('#modalColeta').modal('open');
        var endColeta = await getAddressFromLatLng(userLat, userLng);
        // var valorEndereco = `${endColeta.address.city}, ${endColeta.address.suburb}, ${endColeta.address.road}, ${endColeta.address.house_number}, ${endColeta.address.postcode}`;
        var valorEndereco = `${endColeta.address.road}, ${endColeta.address.house_number} - ${endColeta.address.suburb} - ${endColeta.address.city} - ${endColeta.address.state} - ${endColeta.address.postcode}`;
        $("#txtEnderecoColeta").val(valorEndereco);
    });

    $('#btnAtualizarEnderecoColeta').on('click', async function() {
        let endereco = $("#txtEnderecoColeta").val();
        let response = await getLatLngFromAddress(endereco);

        if(response.length==0)
        {
            return;
        }

        response = response[0];

        let latitude = response.lat;
        let longitude = response.lon;
        setLocation(latitude, longitude);
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

    mapa=L.map("mapa",opcoes);
    mapa.setView([-23.572683, -46.625513], 18);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        maxZoom: 19
    }).addTo(mapa);

    pinIcon = L.icon({
        iconUrl: 'img/pin.png',
        iconSize: [32, 32]
    });
}

function starGeolocation()
{
    navigator.geolocation.getCurrentPosition(geolocationResponse, geolocationError, {
        enableHighAccuracy: true 
    });
}

function geolocationResponse(position)
{
    setLocation(position.coords.latitude, position.coords.longitude);
}

function setLocation(lat, lng) 
{
    userLat = lat;
    userLng = lng;
    mapa.setView([userLat, userLng]);

    L.marker([userLat, userLng], {icon: pinIcon}).addTo(mapa);
}

function geolocationError(error)
{
    alert('code: '    + error.code    + '\n' +
        'message: ' + error.message + '\n');
}

function getAddressFromLatLng(lat, lng)
{
    return new Promise((resolve, reject) => {
        $.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, function(data){
            // console.log(data.address.road);
            resolve(data);
    
        });
    })
}

function getLatLngFromAddress(address)
{
    return new Promise((resolve, reject) => {
        $.get(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${address}`, function(data){

            resolve(data)
        })
    })
}