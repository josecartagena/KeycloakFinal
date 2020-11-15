import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PersonaService} from './service/persona.service';
import {FormControl, FormGroup} from '@angular/forms';
import {NotificationService} from './service/notification.server';
import {BehaviorSubject} from 'rxjs';

import {ChartDataSets} from 'chart.js';
import {BaseChartDirective, Color, Label} from 'ng2-charts';
import { AuthConfig, NullValidationHandler, OAuthModule, OAuthService } from 'angular-oauth2-oidc';


@Component({
  selector: 'umg-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent
  implements OnInit,
    OnDestroy,
    AfterViewInit {
  title = 'profesional';

  // definir "FormGroup" para ingreso de datos por formulario
  public formGroup: FormGroup;
  public contador: number = 0;
   host = new Array();
   actualizar;
    mensajeHtml='<style type="text/css"> '+
    '#frame .content .messages ul li.sent img {'+
      'margin: 6px 8px 0 0;}'+
    '#frame .content .messages ul li.sent p {' +
     'background: #435f7a;'+
      'color: #f5f5f5;}'+
    '#frame .content .messages ul li.replies img {'+
      'float: right;'+
      'margin: 6px 0 0 8px;}'+
    '#frame .content .messages ul li.replies p {'+
      'background: #f5f5f5;'+
      'float: right;'+
      '</style> '
  public texto: String = 'empty';
  public texto2: String = 'texto2';
  mensajes;


  // variable reactiva para actualizar interfaz web
  // subject = observable , al cual yo me puedo suscribir
  private mySubject: BehaviorSubject<any>;

  public dataListArray: Array<any>;
  public dataListArray2 = Array<any>();
  public dataListSubject: BehaviorSubject<any[]>; // = Observable (suscripcion)
  public dataListSubject2: BehaviorSubject<any[]>;

  lineChartData: ChartDataSets[] = [
    {
      data: [85, 72, 78, 75, 77, 75],
      label: 'Crude oil prices'
    },
  ];


  @ViewChild('baseChart') chart: BaseChartDirective;

  lineChartLabels: Label[] = ['January', 'February', 'March', 'April', 'May', 'June'];

  lineChartOptions = {
    responsive: true,
  };

  lineChartColors: Color[] = [
    {
      borderColor: 'black',
      backgroundColor: 'rgba(66,232,25,0.47)',
    },
  ];
  lineChartLegend = true;
  lineChartPlugins = [];
  lineChartType = 'bar';


  constructor(private personaService: PersonaService,
              private notificationService: NotificationService, private oauth: OAuthService) {

    this.mySubject = new BehaviorSubject(null);
                
                this.configure();
    this.dataListArray = new Array<any>();
    this.dataListArray2 = new Array<any>();
    this.dataListSubject = new BehaviorSubject(null);
    this.dataListSubject2 = new BehaviorSubject(null);

  }
  authConfig: AuthConfig = {
    issuer: 'http://localhost:8080/auth/realms/Chat_Backoffice',
    redirectUri: window.location.origin,
    clientId: 'Chat_FrontEnd',
    responseType: 'code',
    scope: 'openid profile email offline_access',
    showDebugInformation: true,
  };
  public onClick(): void {
    console.log('on click');
  }


  public enviarFormulario(): void {
    console.log("array"+this.host.toString)
    console.log('Datos de formulario:' + JSON.stringify(this.formGroup.value));

    let parametros: any = null;
    parametros = Object.assign({}, this.formGroup.value);

    // son los datos de persona
    let datosAEnviar: any = {
      id : localStorage.getItem("id"),
      primerNombre: " ",
      segundoNombre: parametros.apellido,
      edad: "10"
    };

    console.log('Datos a enviar:' + JSON.stringify(datosAEnviar));

    this.personaService.create(datosAEnviar)
      .subscribe(result => {
        console.log('Datos from server:' + JSON.stringify(result));
        console.log('Mensaje recibido:' + JSON.stringify(result));
        //actualizartabla
        //this.mySubject.next(result);
        console.log('id'+result.id)
        console.log('id_L'+localStorage.getItem("id"))
        if(result.id == localStorage.getItem("id")){
          console.log('llego aqui')
          var a = document.getElementById('msg_history')
          var txt = result.segundoNombre
          this.mensajeHtml = this.mensajeHtml+
      '<li class="sent">'+
      //'<img src="http://emilcarlsson.se/assets/mikeross.png" alt="" />'+
     ' <p>'+txt+'</p>'+
    '</li>'

        a.innerHTML=this.mensajeHtml;
        //console.log('esto llega '+JSON.parse(result).segundoNombre)
        }else{
          console.log('aqui no deberia de llegar')
          this.agregarAVector2(JSON.parse(result).segundoNombre);

        }
      });
      (<HTMLInputElement>document.getElementById("txt")).value="";
        
  }


  reloadChart() {
    if (this.chart !== undefined) {
      this.chart.chart.destroy();
      //this.chart.chart = 0;

      this.chart.datasets = this.lineChartData;
      this.chart.labels = this.lineChartLabels;
      this.chart.ngOnInit();
    }
  }

  public agregarContenidoManual(): void {
    this.mySubject.next('from button');
    console.log(this.lineChartData[0].data[0]);


    let actual: any = this.lineChartData[0].data[0];
    this.lineChartData[0].data[0] = actual + 20;
    this.reloadChart();
  }


  public agregarAVector(data: string): void {
    this.contador++;

    let dato: any = null;
    dato = {
      id: this.contador,
      nombre: data,
      edad: 20 + this.contador
    };

    //this.dataListArray.push({id: this.contador});
    //this.dataListArray.push(dato);
    this.dataListArray.push(dato);


   this.dataListSubject.next(this.dataListArray);
    /*   this.dataEstadisticaSubject.next(this.dataListArray);
       this.dataGraficaSubject.next(this.dataListArray);*/

  }

  public actualizarFormulario(): void {

    let parametros: any = null;
    parametros = Object.assign({}, this.formGroup.value);

    let datosAEnviar: any = {
      primerNombre: parametros.nombre,
      segundoNombre: parametros.apellido,
      edad: parametros.edad
    };

    console.log('Datos a enviar:' + JSON.stringify(datosAEnviar));

    this.personaService.update(datosAEnviar).subscribe(result => {
      console.log('Datos from server:' + JSON.stringify(result))

    });
  }


  public actualizarTexto(result: any): void {
    this.texto = this.texto + ' ' + JSON.stringify(result);
    //actualizarGrafica() llame a la funcion reloadChart();
  }


  private initForm(): void {
    this.formGroup = new FormGroup({
      nombre: new FormControl('', []
      ),
      apellido: new FormControl('', []
      ),
      edad: new FormControl('', []
      )
    });


  }

  /* ------------------------------------------------------------------------------------------------- */
  private handleMessageReceived(message: any): void {
    console.log('Mensaje recibido:' + JSON.stringify(message));
    
  }

  /* ------------------------------------------------------------------------------------------------- */
  public doNotificationSubscription(): void {
    try {
      this.notificationService
        .getPersonaNotification()
        .subscribe((result) => {
          console.log('Mensaje recibido:' + JSON.stringify(result));
          //actualizartabla
          //this.mySubject.next(result);
          this.agregarAVector(result.segundoNombre);
          console.log('id'+JSON.parse(result).id)
          console.log('id_L'+localStorage.getItem("id"))
          if(JSON.parse(result).id == localStorage.getItem("id")){
            console.log('llego aqui do notification subcripcion')
            this.agregarAVector(JSON.parse(result).segundoNombre);
            this.mensajes=result;
            var a = document.getElementById('msg_history')
            console.log('a '+a)
            a.innerHTML = '<div class="incoming_msg"> '+
            ' <div class="incoming_msg_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"> </div>'+
            ' <div class="received_msg">'+
            ' <div class="received_withd_msg">'+
               +' <p>'+JSON.parse(result).segundoNombre+'</p>'+
              ' <span class="time_date"> 11:01 AM    |    June 9</span></div> '+
              ' </div> '+
          ' </div>'
          //console.log('esto llega '+JSON.parse(result).segundoNombre)
          const distinctThings = this.mensajes.filter(
            (i, arr) => arr.findIndex(t => t.id === this.mensajes.id) === i
          );
          console.log("esto notifica"+distinctThings)
            for(var i=0; i<this.mensajes.length;i++) {
          var chats = '<li class="contact">'+
					'<div class="wrap">'+
						'<span class="contact-status online"></span>'+
						'<img src="http://emilcarlsson.se/assets/louislitt.png" alt="" />'+
						'<div class="meta">'+
							'<p class="name">Louis Litt</p>'+
							'<p class="preview">You just got LITT up, Mike.</p>'+
						'</div>'+
					'</div>'+
        '</li>'
            }
          }else{
            console.log('aqui no deberia de llegar')
            this.agregarAVector2(JSON.parse(result).segundoNombre);

          }
        });

      /*
            this.notificationService
              .getPersonaNotification()
              .subscribe((result) => {
                console.log('Mensaje recibido:' + JSON.stringify(result));
                //actualizarGrafica
                this.mySubject.next(result);

              });*/


    } catch (e) {
      console.log(e);
    }
  }

  public doSubjectSubscription(): void {
    this.mySubject.subscribe((result) => {
      this.actualizarTexto(result);
    });


    this.mySubject.subscribe((result) => {
      this.texto2 = this.texto2 + JSON.stringify(result);
    });


    /*this.mySubject.subscribe((result)=>{
      this.actualizarGrafica(result);
    });*/

  }

  /* ------------------------------------------------------------------------------------------------- */

  ngAfterViewInit(): void {
    console.log('on after view');
  }

  ngOnDestroy(): void {
    console.log('on destroy');
  }

  /* -------------------------------------------------------------------------------------------------------------------------------- */
  initDataList(): void {
    this.contador++;

    let dato: any = null;
    dato = {
      id: this.contador,
      nombre: 'Hola Como puedo ayudarte',
      edad: 20 + this.contador
    };


    //this.dataListArray.push({id: this.contador});
    //this.dataListArray.push({id: this.contador});
   // this.dataListArray.push(dato);
    this.dataListArray2.push(dato);


    this.dataListSubject2
      .asObservable()
      .subscribe(result => {
        //actualizarGrafica(();
        //alert('actualizacion:' + JSON.stringify(result));
      });

    /*this.dataListSubject
      .asObservable()
      .subscribe(result => {
        //actualizarDatosEstadistica();
        alert('actualizacion:' + JSON.stringify(result));
      });
*/

    this.dataListSubject2.next(this.dataListArray);
  }

  /* -------------------------------------------------------------------------------------------------------------------------------- */

  ngOnInit(): void {
   // this.oauth.loadDiscoveryDocumentAndLogin();
   //this.oauth.loadDiscoveryDocumentAndTryLogin();
   //this.oauth.initImplicitFlowInternal();
    var a = document.getElementById('msg_history')
    a.innerHTML=this.mensajeHtml;
    
    var id = Math.floor(Math.random() * 65000) + 1  ;
    var  prueba = id.toString();
    
    localStorage.setItem("id",prueba);
    console.log('on init'+localStorage.getItem("id"));

    this.initDataList();

    // realizar suscripcion
    this.doNotificationSubscription();

    // realizar subscription para subject (actualiza texto)
    this.doSubjectSubscription();

    // iniciar formulario
    this.initForm();

    // ejecutar llamada de servicio restful al iniciar la aplicacion
    this.personaService
      .personaList(null)
      .subscribe((result) => {
        console.log('RESULTADO:' + JSON.stringify(result));
      });


  }
   aleatorio(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  public agregarAVector2(data: string): void {
    this.contador++;

    let dato: any = null;
    dato = {
      id: this.contador,
      nombre: data,
      edad: 20 + this.contador
    };

    //this.dataListArray.push({id: this.contador});
    //this.dataListArray.push(dato);
    this.dataListArray2.push(dato);


    this.dataListSubject2.next(this.dataListArray2);
    /*   this.dataEstadisticaSubject.next(this.dataListArray);
       this.dataGraficaSubject.next(this.dataListArray);*/

  }
  configure():void{
    this.oauth.configure(this.authConfig);
    this.oauth.tokenValidationHandler = new NullValidationHandler();
    this.oauth.setupAutomaticSilentRefresh();
    //this.oauth.loadDiscoveryDocument().then(() => this.oauth.tryLogin());
    this.oauth.loadDiscoveryDocumentAndLogin();
  }
  login():void{
    this.oauth.initImplicitFlowInternal();
   
  }
  logout():void{

    this.oauth.logOut();
  }
}
