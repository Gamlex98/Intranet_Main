import { Component} from '@angular/core';
import { NgForm } from '@angular/forms';
import { DocumentModel } from 'app/models/document.model';
import { FileService } from 'app/services/file.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})

export class UploadComponent {

  documento: DocumentModel = new DocumentModel ();

  direccion = {url: ""};
  rutaRelativa = "";
  total: number = 0;

  fileToUpload !: File;
  authenticated = false;
  sid = '';

  porcentaje: number = 0;
  enviando: boolean = false;

  constructor ( private service:FileService, private http:HttpClient ) { }

  /* ngOnInit(): void {
    this.fileInfos = this.service.getFiles();
  } */

  authenticate() {
    const usuario = 'Intranet';
    const pass = 'MW50cjQxMjMrLSo=';

    this.service.authenticate(usuario, pass).subscribe(
      authSid => {
        this.authenticated = true;
        this.sid = authSid;
        console.log("SID generado: " + this.sid);
      },
      error => {
        console.error('Authentication failed', error);
      }
    );
  }

  selectedFile(event: any) {
    this.fileToUpload = event.target.files[0];
  }

  onUpload() {
    const pruebaCarpeta = 'carpetaNull';
    const uploadUrl = `http://172.16.1.24:8095/cgi-bin/filemanager/utilRequest.cgi?func=upload&type=standard&sid=${this.sid}&dest_path=/Web/${pruebaCarpeta}&overwrite=1&progress=-Web`;

    const formData = new FormData();
    formData.append('file', this.fileToUpload, this.fileToUpload.name);
    console.log("nombre archivo : " + this.fileToUpload.name);

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    headers.append('Accept', 'application/json');

    const checDir = `http://172.16.1.24:8095/cgi-bin/filemanager/utilRequest.cgi?func=get_tree&sid=${this.sid}&is_iso=1&node=/Web`;

    this.http.get(checDir).subscribe({
      next: (response) => {
        console.log(response);
        const existe = Object.values(response).filter((item: { name: string; type: string; }) => item.name === pruebaCarpeta && item.type === 'dir');
        if (existe.length === 0) {
          const createDir = `http://172.16.1.24:8095/cgi-bin/filemanager/utilRequest.cgi?func=createdir&type=standard&sid=${this.sid}&dest_folder=/Web/${pruebaCarpeta}&dest_path=/Web`;
          this.http.get(createDir).subscribe({
            next: () => {
              this.doUpload(uploadUrl, formData, headers);
            },
            error: (err) => {
              console.error('Error al crear la carpeta de destino', err);
            }
          });
        } else {
          this.doUpload(uploadUrl, formData, headers);
          console.log('Archivo subido , carpeta ya existia');
        }
      },
      error: (err) => {
        console.error('Error al verificar la carpeta de destino', err);
      }
    });
  }

  doUpload(uploadUrl: string, formData: FormData, headers: HttpHeaders) {
    this.http.post(uploadUrl, formData, { headers }).subscribe({
      next: (response) => {
        console.log('Upload successful', response);
      },
      error: (err) => {
        console.error('Upload failed', err);
      }
    });
  }
  
  enviarInfo(form: NgForm){
    if(form.valid) {
      const documento: DocumentModel = {
        // id: form.value.id,
        nombre: form.value.nombre,
        fecha: form.value.fecha,
        area: form.value.area,
        url: form.value.url
      } ;
      this.service.addDocumentos(documento).subscribe({
        next: (data:any)=>{
          console.log("informacion guardada en la base de datos");
        },
        error:(e)=> console.log(e)
      });
      this.progressBar();
    } else {
      alert ("Debes seleccionar un archivo");
      console.log("Error , archivo no seleccionado");
    }
  }
  
  progressBar() {
    this.enviando = true;
    this.porcentaje = 0; // resetear el porcentaje
    let intervalo = setInterval(() => {
      if (this.porcentaje < 100) {
        this.porcentaje += 10;
      } else {
        clearInterval(intervalo);
        this.enviando = false;
      }
    }, 100);
  }
  
  onFolderSelected(event: any) {
    const value = event.target.value;
    this.rutaRelativa = value;
  }

  onFileSelected(event: any) {
    const file: File = event.target?.files?.[0];
    this.total = file.size;
    const reader = new FileReader();
    const rutaBase = "http://172.16.1.24:88/";

    reader.onload = (e: any) => {
      this.direccion.url = rutaBase + this.rutaRelativa + file?.name;
      console.log("url completa : " + this.direccion.url);
    };
  
    reader.readAsDataURL(file);
  }
  
  ajustarAnchoInput(event: any) {
    const input = event.target;
    input.style.width = input.value.length + 'ch';
  }
}

