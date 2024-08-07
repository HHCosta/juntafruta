var userLat = null;
var userLng = null;
var mapa = null;
var pinIcon = null;
var marcador = null;
var modeActive = false;
var pendingIcon = null;
var marcadoresColeta = [];

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);

    
    startAppMenu();
    startModalColeta();
    startMapa();
    startMode();
    starGeolocation();
    startModalMinhasColetas();
}


function startAppMenu()
{
    $('#appMenu').sidenav();

    $('#mnuIniciarColeta').on("click",() => {
        abrirModalColeta();
        $('#appMenu').sidenav("close");
    })
    
    $('#mnuLocais').on("click",() => {
        swal("Em construção");
        $('#appMenu').sidenav("close");
    })

    $('#mnuMinhasColetas').on("click",() => {
        $("#modalMinhasColetas").modal("open");
        $('#appMenu').sidenav("close");

        carregarListaMinhasColetas();
    })
}

function startModalMinhasColetas()
{
    $('#modalMinhasColetas').modal();
}

function startModalColeta()
{
    $('#modalColeta').modal();
    $('#btnColeta').on('click', async function() {
        abrirModalColeta();
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

    $('#btnModalColetaCadastrar').on('click', async function(){
        let isValid = validateFormularioColeta();

        if(isValid == true)
        {
            $('#btnModalColetaCadastrar').addClass("disabled");
            $('#coletaSaveLoading').removeClass("hide");
            await sendColeta();
            $('#coletaSaveLoading').addClass("hide");
            $('#btnModalColetaCadastrar').removeClass("disabled");

            $("#txtItensColeta").val("");
            $("#txtPesoColeta").val("");
            $("#txtPhoneColeta").val("");
            $("#txtNomeContatoColeta").val("");
            swal("Cadastrado!", "Dados enviados com sucesso", "success");
            $('#modalColeta').modal('close');
        }
    })
}

function startMapa()
{ 
    userLat = localStorage.getItem("latitude") != null ? parseFloat(localStorage.getItem("latitude")) : null;
    userLng = localStorage.getItem("longitude") != null ? parseFloat(localStorage.getItem("longitude")) : null;

    var opcoes = {
        fullscreenControl:true,
        fullscreenControlOptions: {
            position:"topleft"
        }
    }

    let mapaLat = userLat != null ? userLat : -23.572683;
    let mapaLng = userLng != null ? userLng : -46.625513;

    mapa=L.map("mapa",opcoes);
    mapa.setView([mapaLat, mapaLng], 18);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        maxZoom: 19
    }).addTo(mapa);

    pinIcon = L.icon({
        iconUrl: 'img/pin.png',
        iconSize: [32, 32]
    });

    mapa.on('click', function(e) {        
        // var popLocation= e.latlng;
        // var popup = L.popup()
        // .setLatLng(popLocation)
        // .setContent('<p>Hello world!<br />This is a nice popup.</p>')
        // .openOn(mapa);
        
        setLocation(e.latlng.lat, e.latlng.lng);
    });
}

function startMode()
{
    inactivateAdmMode();
    modeActive = false;
    $("#btnToggleAdmMode").on("click", function(){
        if(modeActive == true)
        {
            modeActive = false;
        }
        else
        {
            modeActive = true;
        }

        if(modeActive == true)
        {
            activateAdmMode();
        }
        else
        {
            inactivateAdmMode();
        }
    })
}

function activateAdmMode()
{
    $("#btnToggleAdmMode").addClass("btn-toggle-adm-mode-active");
    $("#btnToggleAdmMode").removeClass("btn-toggle-adm-mode-inactive");

    

    atualizarMarcadoresColetaPendente();
}

function limparMarcadoresColetasPendentes()
{
    // limpar marcadores existentes
    for(let ix=0;ix < marcadoresColeta.length;ix++)
    {
        let m = marcadoresColeta[ix];
        mapa.removeLayer(m);
    }
}

function atualizarMarcadoresColetaPendente()
{
    limparMarcadoresColetasPendentes();

    pendingIcon = L.icon({
        iconUrl: 'img/relogio.png',
        iconSize: [32, 32]
    });

    marcadoresColeta = [];

    var settings = {
        "url": `http://109.199.109.64:3000/coletas-pendentes`,
        "method": "GET",
        "timeout": 0
    };

    $.ajax(settings).done(function (response) {
        const list = response.list;

        for(let ix=0;ix < list.length;ix++)
        {
            let reg = list[ix];
            let lat = reg.latitude;
            let lng = reg.longitude;
            let endereco = reg.endereco;

            if(lat == null || lng == null)
            {
                continue;
            }
            if(lat == 0 || lng == 0)
            {
                continue;
            }
    

            let m = L.marker([lat, lng], {icon: pendingIcon});

            // var popup = L.popup();
            // popup.setContent(`<p>${endereco}</p>`);
            // m.bindPopup(popup).openPopup();

            m.bindPopup(`
                <p>${endereco}</p>
                <div class="btn-fazer-coleta-wrap">
                    <a href="#!" class="btn-small btn-fazer-coleta" data-id="${reg.id}" onClick="doColeta('${reg.id}')">
                        <i class="fa-solid fa-check left"></i>
                        Coletar
                    </a>
                </div>
            `).openPopup();
            m.addTo(mapa);

            marcadoresColeta.push(m);
        }

    });
}

function doColeta(idColeta)
{
    swal({
        title: "Você deseja efetuar esta coleta?",
        text: "",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((willUpdate) => {
        if (willUpdate == true)
        {
            var settings = {
                "url": "http://109.199.109.64:3000/efetuarcoleta",
                "method": "POST",
                "timeout": 0,
                "headers": {
                    "Content-Type": "application/json"
                },
                "data": JSON.stringify({
                    "id": idColeta
                })
            };
                
        
            $.ajax(settings).done(function (response) {
                swal("Coleta efetuada com sucesso");
                atualizarMarcadoresColetaPendente();
            });                    
        }
    });  
}

function inactivateAdmMode()
{
    $("#btnToggleAdmMode").addClass("btn-toggle-adm-mode-inactive");
    $("#btnToggleAdmMode").removeClass("btn-toggle-adm-mode-active");
    limparMarcadoresColetasPendentes();
}

function starGeolocation()
{
    userLat = localStorage.getItem("latitude") != null ? parseFloat(localStorage.getItem("latitude")) : null;
    userLng = localStorage.getItem("longitude") != null ? parseFloat(localStorage.getItem("longitude")) : null;

    if(userLat == null || userLng == null)
    {
        navigator.geolocation.getCurrentPosition(geolocationResponse, geolocationError, {
            enableHighAccuracy: true 
        });
    }
    else   
    {
        setLocation(userLat, userLng);
    }

    $("#btnMapResetPosition").on('click', function(){
        navigator.geolocation.getCurrentPosition(geolocationResponse, geolocationError, {
            enableHighAccuracy: true 
        });
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

    if(marcador == null)
    {
        marcador = L.marker([userLat, userLng], {icon: pinIcon})
        marcador.addTo(mapa);
    }
    else
    {
        let latlng = L.latLng(userLat, userLng);
        marcador.setLatLng(latlng);
    }

    
    localStorage.setItem("latitude", userLat.toString());
    localStorage.setItem("longitude", userLng.toString());
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

function validateFormularioColeta()
{
    let endereco = $("#txtEnderecoColeta").val();
    let itens = $("#txtItensColeta").val();
    let phone = $("#txtPhoneColeta").val();
    let nome = $("#txtNomeContatoColeta").val();

    let result = true;
    $("#txtEnderecoColeta").removeClass("invalid-field");
    $("#txtItensColeta").removeClass("invalid-field");
    $("#txtPhoneColeta").removeClass("invalid-field");
    $("#txtNomeContatoColeta").removeClass("invalid-field");

    if(endereco.trim().length == 0)
    {
        result = false;
        $("#txtEnderecoColeta").addClass("invalid-field");
    }
    
    if(itens.trim().length == 0)
    {
        result = false;
        $("#txtItensColeta").addClass("invalid-field");
    }
    
    if(phone.trim().length == 0)
    {
        result = false;
        $("#txtPhoneColeta").addClass("invalid-field");
    }
    
    if(nome.trim().length == 0)
    {
        result = false;
        $("#txtNomeContatoColeta").addClass("invalid-field");
    }    

    return result;
}

function sendColeta()
{
    return new Promise(async (resolve, reject) => {
        let deviceid = device.uuid != null ? device.uuid : "dev";
        let lat = 0;
        let long = 0;
        let endereco = $("#txtEnderecoColeta").val();
        let latlng = await getLatLngFromAddress(endereco);

        if(latlng.length!=0)
        {
            latlng = latlng[0];

            lat = latlng.lat;
            long = latlng.lon;
        }

        
        var settings = {
            "url": "http://109.199.109.64:3000/savecoleta",
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify({
                "deviceid": deviceid,
                "endereco": $("#txtEnderecoColeta").val(),
                "latitude": lat,
                "longitude": long,
                "peso": $("#txtPesoColeta").val(),
                "itens_coleta": $("#txtItensColeta").val(),
                "nome": $("#txtNomeContatoColeta").val(),
                "phone": $("#txtPhoneColeta").val()
            })
        };
            
    
        $.ajax(settings).done(function (response) {
            console.log(response);
            resolve();
        });
    })
    
}

async function abrirModalColeta()
{
    $('#modalColeta').modal('open');
    var endColeta = await getAddressFromLatLng(userLat, userLng);
    // var valorEndereco = `${endColeta.address.city}, ${endColeta.address.suburb}, ${endColeta.address.road}, ${endColeta.address.house_number}, ${endColeta.address.postcode}`;

    let vEndereco = typeof endColeta.address.road != 'undefined' ? endColeta.address.road : "";
    let vHouseNum = typeof endColeta.address.house_number != 'undefined' ? endColeta.address.house_number : "";
    let vSuburb = typeof endColeta.address.suburb != 'undefined' ? endColeta.address.suburb : "";
    let vCity = typeof endColeta.address.city != 'undefined' ? endColeta.address.city : "";
    let vState = typeof endColeta.address.state != 'undefined' ? endColeta.address.state : "";
    let vPostCode = typeof endColeta.address.postcode != 'undefined' ? endColeta.address.postcode : "";


    var valorEndereco = `${vEndereco}${vHouseNum.length > 0 ? ',': ''} ${vHouseNum} - ${vSuburb} - ${vCity} - ${vState} - ${vPostCode}`;
    $("#txtEnderecoColeta").val(valorEndereco);
}

function carregarListaMinhasColetas()
{
    let deviceid = device.uuid != null ? device.uuid : "dev";
    var settings = {
        "url": `http://109.199.109.64:3000/minhascoletas/${deviceid}`,
        "method": "GET",
        "timeout": 0
    };
            
    
    $.ajax(settings).done(function (response) {
        const coletas = response.coletas;
        $("#listaMinhasColetas").empty();
        for(let ix = 0; ix < coletas.length; ix++)
        {
            const registro = coletas[ix];

            let status = "";
            if(registro.status == 0)
            {
                status = "Aguardando Coleta";
            }
            else if(registro.status == 1)
            {
                status = "Coletado";
            }
            else if(registro.status == 2)
            {
                status = "Problema ao Coletar";
            }           
             
            const htmlItem = `
                <li class="collection-item item-minhas-coletas">
                    <div>
                        <i class="fa-solid fa-location-pin"></i>
                        <span>
                            ${registro.endereco}
                        </span>
                    </div>
                    <div>
                        <i class="fa-solid fa-weight-hanging"></i>
                        <span>
                            ${registro.peso}
                        </span>
                    </div>
                    <div>
                        <i class="fa-solid fa-truck"></i>
                        <span>
                            ${status}
                        </span>
                    </div>
                    <div class="coleta-controls">
                        <a href="#!" class="btn-floating btn-small btn-coleta-remove" data-id="${registro.id}">
                            <i class="fa-solid fa-trash-can"></i>
                        </a>
                    </div>
                </li>             
            `;
            $("#listaMinhasColetas").append(htmlItem);
        }
        
        $(`.btn-coleta-remove`).on("click", function(){
            const idColeta = $(this).attr("data-id");

            swal({
                title: "Você deseja remover esta coleta?",
                text: "Uma vez apagado não será possível recuperar.",
                icon: "warning",
                buttons: true,
                dangerMode: true,
              })
              .then((willDelete) => {
                if (willDelete == true)
                {
                    var settings = {
                        "url": "http://109.199.109.64:3000/deletecoleta",
                        "method": "DELETE",
                        "timeout": 0,
                        "headers": {
                            "Content-Type": "application/json"
                        },
                        "data": JSON.stringify({
                            "id": idColeta
                        })
                    };
                        
                
                    $.ajax(settings).done(function (response) {
                        swal("Registro removido com sucesso");
                        carregarListaMinhasColetas();
                    });                    
                }
              });

            
        })

    });

        


}