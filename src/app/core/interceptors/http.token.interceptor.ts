import { Injectable, Injector } from "@angular/core";
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest
} from "@angular/common/http";
import { Observable, from } from "rxjs";

import { JwtService } from "../services";
import { HttpHeaders, HttpClient, HttpParams } from "@angular/common/http";
import { map } from "rxjs/operators";

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {
  constructor(private jwtService: JwtService, private http: HttpClient) {}

  me: { access_token: string };

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return from(this.addBearerToken(req, next));
  }

  private async addBearerToken(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Promise<HttpEvent<any>> {
    // let token: string;

    const headersConfig = {
      "Content-Type": "application/json",
      Accept: "application/json"
    };

    // let token: Promise<string>; // = req.headers.get("x-ms-token-aad-access_token");
    // console.log("x-ms-token-aad-access_token: " + token);

    console.log("req.url: " + req.url);
    // console.log("req.url.search result: " + req.url.search(/\b\/\.auth\/me/g));
    // console.log("req.url.indexOf result: " + req.url.indexOf(".auth/me"));

    if (
      !this.me &&
      !this.me.access_token &&
      req.url.search(/\b\/\.auth\/me/g) == -1
    ) {
      // let token = this.jwtService.getToken();
      await this.http
        .get<any>("https://teamwizapp.azurewebsites.net/.auth/me")
        .toPromise()
        .then(x => {
          this.me = x[0];
          return x[0].access_token;
        });
    }

    if (this.me.access_token) {
      headersConfig["Authorization"] = `Bearer ${this.me.access_token}`;
    }

    console.log("exiting HttpInterceptor, token is: " + this.me.access_token);
    const request = req.clone({
      setHeaders: headersConfig,
      withCredentials: true
    });
    return next.handle(request).toPromise();
  }

  // getAuthMe(): Observable<string> {
  //   // let bar = this.http.post("https://teamwizapp.azurewebsites.net/.auth/login/google", { "id_token": "<id_token>")
  //   return this.http
  //     .get<any>("https://teamwizapp.azurewebsites.net/.auth/me");
  //     // .subscribe(data => data.access_token as string);
  //   // return data.access_token;
  //   // console.log("in getMe.then() data result: " + foo);
  //   // return foo;
  // }
}
