package com.webkit.sonsation_server.mapper;

import com.webkit.sonsation_server.model.Sign;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SignDetail {
    private String name;
    private String description;
    private String url;

    // Sign -> SignDetail.json
    public static SignDetail toDetail(Sign sign){
        return SignDetail.builder()
                .name(sign.getName())
                .description(sign.getDescription())
                .url(sign.getUrl())
                .build();
    }
}
