package com.webkit.sonsation_server.controller;

import com.webkit.sonsation_server.code.ErrorCode;
import com.webkit.sonsation_server.code.SuccessCode;
import com.webkit.sonsation_server.mapper.QuizListItem;
import com.webkit.sonsation_server.mapper.SignDetail;
import com.webkit.sonsation_server.response.ApiResponse;
import com.webkit.sonsation_server.service.SignService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/sign")
@CrossOrigin(origins = "http://localhost:5173")
public class SignController {
    private final SignService signService;

    @GetMapping
    public ApiResponse<?> getSigns(@RequestParam(required = false) String keyword) {
        try {
            List<?> listItems =  keyword == null || keyword.isBlank()
                    ? signService.getAllSigns()
                    : signService.searchSigns(keyword);

            return ApiResponse.success(
                    listItems.isEmpty()
                            ? SuccessCode.DATA_EMPTY
                            : SuccessCode.OK,
                    listItems
            );
        } catch (Exception e) {
            return ApiResponse.fail(ErrorCode.SERVER_ERROR, e.getMessage());
        }
    }

    @GetMapping("/name")
    public ApiResponse<List<QuizListItem>> getAllSignNames(){
        try {
            List<QuizListItem> quizItemList = signService.getQuizItems();

            return ApiResponse.success(SuccessCode.OK, quizItemList);
        } catch (Exception e) {
            return ApiResponse.fail(ErrorCode.SERVER_ERROR, e.getMessage());
        }
    }

    @GetMapping("/{sign_id}")
    public ApiResponse<SignDetail> getSign(
            @PathVariable(value = "sign_id") Long id
    ){
        try {
            SignDetail signDetail = signService.getSign(id);

            return ApiResponse.success(SuccessCode.OK, signDetail);
        } catch (Exception e) {
            return ApiResponse.fail(ErrorCode.SERVER_ERROR, e.getMessage());
        }
    } //
}
