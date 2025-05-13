package com.webkit.sonsation_server.mapper;

import com.webkit.sonsation_server.model.Sign;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Builder
@AllArgsConstructor
@Getter
public class SignListDetail {
    private Long id;
    private String name;
    private String url;

    public static SignListDetail toListDetail(Sign sign){
        return SignListDetail.builder()
                .id(sign.getId())
                .name(sign.getName())
                .url(sign.getUrl())
                .build();
    }
}
