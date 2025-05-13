package com.webkit.sonsation_server.code;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum ErrorCode implements ApiCode {
    SERVER_ERROR(500000, "서버 내부 오류");


    private final int code;
    private final String message;
}
