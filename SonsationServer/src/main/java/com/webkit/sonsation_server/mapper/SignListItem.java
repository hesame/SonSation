package com.webkit.sonsation_server.mapper;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

@Builder
@AllArgsConstructor
@Getter
public class SignListItem {
    private String category;
    private List<SignListDetail> items;


    // Category + Sign -> SignListItem
    public static SignListItem toListItem(String category, List<SignListDetail> items){
        return SignListItem.builder()
                .category(category)
                .items(items)
                .build();
    }
}
