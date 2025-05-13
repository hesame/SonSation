package com.webkit.sonsation_server.response;

import com.webkit.sonsation_server.code.ErrorCode;
import com.webkit.sonsation_server.code.SuccessCode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse<T> {
    private boolean success;
    private int code;
    private T data;

    public static <T> ApiResponse<T> success(SuccessCode code, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .code(code.getCode())
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> fail(ErrorCode code, String detailMessage) {
        Map<String, String> errorData = new HashMap<>();
        errorData.put("message", code.getMessage() + (detailMessage != null ? ": " + detailMessage : ""));

        return ApiResponse.<T>builder()
                .success(false)
                .code(code.getCode())
                .data((T) errorData)
                .build();
    }
}


