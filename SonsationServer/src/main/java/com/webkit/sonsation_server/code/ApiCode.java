package com.webkit.sonsation_server.code;

public interface ApiCode {
    int getCode();
    default int getHttpStatus(){
        return getCode()/1000;
    }
}
