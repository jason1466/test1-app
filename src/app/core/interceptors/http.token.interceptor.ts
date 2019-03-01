import { Injectable, Injector } from "@angular/core";
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest
} from "@angular/common/http";
import { Observable } from "rxjs";

import { JwtService } from "../services";
import { HttpHeaders, HttpClient, HttpParams } from "@angular/common/http";
import { map } from "rxjs/operators";

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {
  constructor(private jwtService: JwtService, private http: HttpClient) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const headersConfig = {
      "Content-Type": "application/json",
      Accept: "application/json"
    };

    let token = req.headers.get("x-ms-token-aad-access_token");
    console.log("x-ms-token-aad-access_token: " + token);

    console.log("req.url: " + req.url);
    console.log("req.url.search result: " + req.url.search(/\b\/\.auth\/me/g));
    console.log("req.url.indexOf result: " + req.url.indexOf(".auth/me"));

    if (req.url.search(/\b\/\.auth\/me/g) == -1) {
      // let token = this.jwtService.getToken();
      console.log("/.auth/me not found in req.url: ");
      token = this.getAuthMe().then(data => data);
      // console.log("back from getMe.then() data result: " + data);
      // token = data;
    }

    if (token) {
      headersConfig["Authorization"] = `Bearer ${token}`;
      // headersConfig['Authorization'] = `Token ${token}`;
    }

    console.log("exiting HttpInterceptor, token is: " + token);
    const request = req.clone({ setHeaders: headersConfig });
    return next.handle(request);
  }

  async getAuthMe(): Promise<string> {
    // let bar = this.http.post("https://teamwizapp.azurewebsites.net/.auth/login/google", { "id_token": "<id_token>")
    let foo = await this.http
      .get<any>("https://teamwizapp.azurewebsites.net/.auth/me")
      .toPromise()
      .then(data => data.access_token);
    // return data.access_token;
    console.log("in getMe.then() data result: " + foo);
    return foo;
  }
}
