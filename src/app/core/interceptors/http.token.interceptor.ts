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
    let token: string;

    const headersConfig = {
      "Content-Type": "application/json",
      Accept: "application/json"
    };

    // let token: Promise<string>; // = req.headers.get("x-ms-token-aad-access_token");
    // console.log("x-ms-token-aad-access_token: " + token);

    console.log("req.url: " + req.url);
    // console.log("req.url.search result: " + req.url.search(/\b\/\.auth\/me/g));
    // console.log("req.url.indexOf result: " + req.url.indexOf(".auth/me"));

    if (req.url.search(/\b\/\.auth\/me/g) == -1) {
      // let token = this.jwtService.getToken();
      console.log("/.auth/me not found in req.url: ");
      token = await this.http
        .get<any>("https://teamwizapp.azurewebsites.net/.auth/me")
        .toPromise()
        .then(x => x.access_token);
      // .subscribe(x => {
      //   token = x.access_token;
      //   console.log(
      //     "back from getMe.subscribe() access_token result: " + token
      //   );
      // });
    }

    if (token) {
      headersConfig["Authorization"] = `Bearer ${token}`;
      // headersConfig['Authorization'] = `Token ${token}`;
    }

    console.log("exiting HttpInterceptor, token is: " + token);
    const request = req.clone({ setHeaders: headersConfig });
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
