package com.webkit.sonsation_server.code;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum SuccessCode implements ApiCode{
    OK(200000), DATA_EMPTY(2000001);

    private final int code;
}
