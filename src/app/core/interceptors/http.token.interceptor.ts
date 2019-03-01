import { Injectable, Injector } from "@angular/core";
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest
} from "@angular/common/http";
import { Observable } from "rxjs";

import { JwtService } from "../services";
import { ApiService } from "../services";
import { map } from "rxjs/operators";

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {
  constructor(private jwtService: JwtService, private apiService: ApiService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const headersConfig = {
      "Content-Type": "application/json",
      Accept: "application/json"
    };

    let token = req.headers.get("x-ms-token-aad-access_token");
    // let token = this.jwtService.getToken();
    console.log("x-ms-token-aad-access_token: " + token);
    this.getMe().then(data => {
      token = data;
    });
    if (token) {
      headersConfig["Authorization"] = `Bearer ${token}`;
      console.log(".auth/me token: " + token);
      // headersConfig['Authorization'] = `Token ${token}`;
    }
    const request = req.clone({ setHeaders: headersConfig });
    return next.handle(request);
  }

  async getMe(): Promise<string> {
    return await this.apiService
      .get("/.auth/me")
      .toPromise()
      .then(data => {
        console.log("in getMe.then()");
        return data.access_token;
      });
  }
}
