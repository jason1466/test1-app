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

  async intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const headersConfig = {
      "Content-Type": "application/json",
      Accept: "application/json"
    };

    // let token = null;

    let token = req.headers.get("x-ms-token-aad-access_token");
    // let token = this.jwtService.getToken();

    await this.apiService.get("/.auth/me").pipe(
      map(data => {
        token = data.access_token;
      })
    );
    if (token) {
      headersConfig["Authorization"] = `Bearer ${token}`;
      console.log(".auth/me token: " + token);
      // headersConfig['Authorization'] = `Token ${token}`;
    }
    const request = req.clone({ setHeaders: headersConfig });
    return next.handle(request);
  }

  // async getMe() {}
}
