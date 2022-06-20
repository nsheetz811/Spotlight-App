package com.cs473.spotlight.repository;

import com.cs473.spotlight.model.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {
    List<Invitation> findAllByUserId(String id);
    boolean existsByProjectIdAndUserId(Long projectId, String userId);
}
