package com.webkit.sonsation_server.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@Builder
@NoArgsConstructor
@Getter
public class Sign {
    @Id @GeneratedValue
    private Long id;

    private String name;

    private String description;

    @Column(name = "video_url")
    private String url;
}
