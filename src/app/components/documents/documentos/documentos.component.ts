
import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DocumentModel } from 'app/models/document.model';
import { FileService } from 'app/services/file.service';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'documents',
  styleUrls: ['documentos.component.css'],
  templateUrl: 'documentos.component.html',
})

export class DocumentosComponent implements OnInit ,AfterViewInit {
  @ViewChild(MatSort) sort !: MatSort;

  // mostrar_columnas: string[] = ['fecha', 'area', 'nombre', 'url', 'download' ];
  mostrar_columnas: string[] = ['fecha', 'area', 'nombre', 'download' ];

  datosTH = new MatTableDataSource<DocumentosTH>(documentosTH);
  datosCT = new MatTableDataSource<DocumentosCT>(documentosCT);
  datosIP = new MatTableDataSource<DocumentosIP>(documentosIP);
  datosSG = new MatTableDataSource<DocumentosSG>(documentosSG);
  datosSIG = new MatTableDataSource<DocumentosSIG>(documentosSIG);

  tablaSeleccionada: MatTableDataSource<any> = this.datosTH;
  documento: DocumentModel = new DocumentModel ();
  // loading: boolean = false;
  // fechaInicio !: any;
  // fechaFin !: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private service: FileService, private http : HttpClient) {}

  ngOnInit() {
    this.service.getDocumentosPorArea('talento humano').subscribe((documentos: DocumentosTH[]) => {
      this.datosTH.data = documentos;
      this.datosTH.paginator = this.paginator;
    });
  }

  ngAfterViewInit() {
    this.datosTH.paginator = this.paginator;
    this.datosCT.paginator = this.paginator;
    this.datosIP.paginator = this.paginator;
    this.datosSG.paginator = this.paginator;
    this.datosSIG.paginator = this.paginator;
  }
             
  onChange(event: any) {
    switch (event.value) {
      case 'TH':
        this.tablaSeleccionada = this.datosTH;
        this.service.getDocumentosPorArea('talento humano').subscribe((documentos: DocumentosTH[]) => {
          this.tablaSeleccionada.data= documentos;
        });
        break;
      case 'CT': 
        this.tablaSeleccionada = this.datosCT;
        this.service.getDocumentosPorArea('contabilidad').subscribe((documentos: DocumentosCT[]) => {
          this.tablaSeleccionada.data= documentos;
        });
  
        break;
      case 'IP':
        this.tablaSeleccionada = this.datosIP;
        this.service.getDocumentosPorArea('importaciones').subscribe((documentos: DocumentosIP[]) => {
          this.tablaSeleccionada.data= documentos;
        });
        break;
      case 'SG':
        this.tablaSeleccionada = this.datosSG;
        this.service.getDocumentosPorArea('servicios generales').subscribe((documentos: DocumentosSG[]) => {
          this.tablaSeleccionada.data= documentos;
        });
        break;
      case 'SIG':
        this.tablaSeleccionada = this.datosSIG;
        this.service.getDocumentosPorArea('sistemas integrados').subscribe((documentos: DocumentosSIG[]) => {
          this.tablaSeleccionada.data= documentos;
        });
        break;
   /*    default:
        this.tablaSeleccionada = this.datosTH;
        this.service.getDocumentosPorArea('talento humano').subscribe((documentos: DocumentosTH[]) => {
          this.tablaSeleccionada.data= documentos;
        });
        break; */
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.tablaSeleccionada.filterPredicate = (data: any, filter: string) => data.nombre.trim().toLowerCase().indexOf(filter) !== -1;
    this.tablaSeleccionada.filter = filterValue;
    if (!filterValue) {
      this.tablaSeleccionada.filter = '';
    }
  }
  
  /* filtrarFecha (inicio : string, fin : string) {
    const datos = this.tablaSeleccionada.data;
  
    const datosFiltrados = datos.filter (dato => {
      const fechaDato = new Date (dato.fecha);
      const fechaInicio = new Date (inicio);
      const fechaFin = new Date (fin);
      return fechaDato >= fechaInicio && fechaDato <= fechaFin;
    });
  
    this.tablaSeleccionada.data = datosFiltrados;
  } */
  
  enviarInfo(form: NgForm){
    if(form.valid) {
      const documento: DocumentModel = {
        // id: form.value.id,
        nombre: form.value.nombre,
        fecha: form.value.fecha,
        area: form.value.area,
        url: form.value.url
      };
      this.service.addDocumentos(documento).subscribe({
        next: (data:any)=>{
          console.log("informacion guardada en la base de datos");
        },
        error:(e)=> console.log("Error en el envio a la BD", e)
      });
    }
  }

 /*  getNombrearchivo(nombre:any) {
    this.service.getNombre(nombre);
    console.log("este es el nombre:" + nombre);
  } */
  
  downloadFile(url: string, nombre: string): void {
    this.service.getNombre(nombre).subscribe((comunicado: any) => {
      const nombreArchivo = comunicado[0].nombre;
      const urlArchivo = comunicado[0].url;
      const extension = urlArchivo.substring(urlArchivo.lastIndexOf('.') + 1);
      const nombreCompleto = `${nombreArchivo}.${extension}`;

      this.http.get(urlArchivo, { responseType: 'blob' }).subscribe((archivo: any) => {
        const blob = new Blob([archivo]); 
        const link = document.createElement('a'); 
        link.href = window.URL.createObjectURL(blob); 
        link.download = nombreCompleto; 
        link.click();
      });
    });
  }
  
  ajustarAnchoInput(event: any) {
    const input = event.target;
    input.style.width = input.value.length + 'ch';
  }
} 

export interface DocumentosTH {
  fecha: string;
  nombre: string;
  area : string;
  url: string;
  download: string;
}

const documentosTH: DocumentosTH[] = [];

export interface DocumentosCT {
  fecha : string;
  nombre: string;
  area : string;
  url: string;
  download: string;
}

const documentosCT: DocumentosCT[] = [];

export interface DocumentosIP {
  fecha : string;
  nombre: string;
  area : string;
  url: string;
  download: string;
}

const documentosIP: DocumentosIP[] = [];

export interface DocumentosSG {
  fecha : string;
  nombre: string;
  area : string;
  url: string;
  download: string;
}

const documentosSG: DocumentosSG[] = [];

export interface DocumentosSIG {
  fecha : string;
  nombre: string;
  area : string;
  url: string;
  download: string;
}

const documentosSIG: DocumentosSIG[] = [];

