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

    if (req.url.search(/\b\/.auth\/me/g) < 0) {
      // let token = this.jwtService.getToken();
      this.getAuthMe().then(data => {
        token = data;
      });
    }

    if (token) {
      headersConfig["Authorization"] = `Bearer ${token}`;
      console.log(".auth/me token: " + token);
      // headersConfig['Authorization'] = `Token ${token}`;
    }

    const request = req.clone({ setHeaders: headersConfig });
    return next.handle(request);
  }

  async getAuthMe(): Promise<string> {
    return await this.http
      .get<any>("/.auth/me")
      .toPromise()
      .then(data => {
        console.log("in getMe.then()");
        return data.access_token;
      });
  }
}
