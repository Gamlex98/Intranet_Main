import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { DocumentModel } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  urlLoopback = 'http://172.16.1.249:3030';
  // UrlDocumento = "http://172.16.1.24:88/";
  urlNas = 'http://172.16.1.24:8095/cgi-bin/authLogin.cgi?';
  
  constructor(private http: HttpClient) { }

  authenticate(username: string, password: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const body = `user=${username}&pwd=${password}`;

    return this.http.post(this.urlNas, body, { headers, responseType: 'text' }).pipe(
      map(response => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response, 'text/xml');
        const authSid = xmlDoc.getElementsByTagName('authSid')[0].childNodes[0].nodeValue;
        return authSid;
      })
    );
  }

  // getFiles(): Observable<any> {
  //   return this.http.get(`${this.UrlDocumento}/documentos`);
  // }
    
  addDocumentos(documento: DocumentModel): Observable<any> {
    console.log("Se agrega la info del documento :")    
    console.log(documento.nombre);
    console.log(documento.fecha);
    console.log(documento.area);
    console.log(documento.url);
    
    const fechaISO = new Date(documento.fecha + 'T00:00:00Z').toISOString();

    return this.http.post(`${this.urlLoopback}/comunicados`, {
      // id: documento.id,
      nombre: documento.nombre,
      fecha: fechaISO,
      area: documento.area,
      url: documento.url
    });
  }

  getDocumentosPorArea(area: string): Observable<any> {
    // return this.http.get(`${this.urlLoopback}/comunicados?filter[where][area]=${area}`);
    return this.http.get(`${this.urlLoopback}/comunicados?filter={"order": "id DESC", "where":{"area":"${area}"}}`);
  }

  getUrl(url: string): Observable<any> {
    return this.http.get(`${this.urlLoopback}/comunicados?filter[where][url]=${url}`);
  }

  getNombre (nombre: string): Observable<any> {
    return this.http.get(`${this.urlLoopback}/comunicados?filter[where][nombre]=${nombre}`);
  }
}