package com.webkit.sonsation_server.repository;

import com.webkit.sonsation_server.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.signs")
    List<Category> findAllWithSigns();
}
