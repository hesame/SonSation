package com.webkit.sonsation_server.service;

import com.webkit.sonsation_server.mapper.QuizListItem;
import com.webkit.sonsation_server.mapper.SignDetail;
import com.webkit.sonsation_server.mapper.SignListDetail;
import com.webkit.sonsation_server.mapper.SignListItem;
import com.webkit.sonsation_server.model.Category;
import com.webkit.sonsation_server.model.Sign;
import com.webkit.sonsation_server.repository.CategoryRepository;
import com.webkit.sonsation_server.repository.SignRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SignService {
    private final CategoryRepository categoryRepository;
    private final SignRepository signRepository;


    public List<SignListItem> getAllSigns() {
        List<Category> categories = categoryRepository.findAllWithSigns();

        return categories.stream()
                .map(category -> {
                    List<SignListDetail> items = category.getSigns().stream()
                            .map(sign -> SignListDetail.toListDetail(sign))
                            .toList();
                    return SignListItem.toListItem(category.getName(), items);
                })
                .toList();
    }

    public List<SignListDetail> searchSigns(String keyword) {
        List<Sign> signs = signRepository.findByNameContaining(keyword);

        return signs.stream().map(
                sign -> SignListDetail.toListDetail(sign)
        ).toList();
    }

    public List<QuizListItem> getQuizItems() {
        return signRepository.getQuizItems();
    }

    public SignDetail getSign(Long id) {
        Sign sign = signRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("해당 수어가 존재하지 않습니다: id = " + id));

        return SignDetail.toDetail(sign);
    }
}
