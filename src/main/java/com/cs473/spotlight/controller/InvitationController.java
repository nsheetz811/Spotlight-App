package com.cs473.spotlight.controller;

import com.cs473.spotlight.model.Invitation;
import com.cs473.spotlight.model.Project;
import com.cs473.spotlight.model.User;
import com.cs473.spotlight.repository.InvitationRepository;
import com.cs473.spotlight.repository.ProjectRepository;
import com.cs473.spotlight.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api")
public class InvitationController {
    @Autowired
    private InvitationRepository invitationRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProjectRepository projectRepository;

    @GetMapping("/invitations")
    public ResponseEntity<List<Invitation>> getAllInvitations(Principal principal) {
        List<Invitation> invitations = invitationRepository.findAllByUserId(principal.getName());
        return new ResponseEntity<>(invitations, HttpStatus.OK);
    }

    @PostMapping("/invitations/{id}")
    public ResponseEntity<?> createInvitation(@PathVariable("id") Long id, @RequestBody String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        Project project = projectRepository.findById(id).orElse(null);

        if (user != null && project != null) {
            if (invitationRepository.existsByProjectIdAndUserId(id, user.getId()) || project.getUsers().contains(user))
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);

            return new ResponseEntity<>(invitationRepository.save(new Invitation(project, user)), HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PutMapping("/invitations/{id}")
    public ResponseEntity<Project> acceptInvitation (@PathVariable("id") Long id) {
        Invitation invitation = invitationRepository.getById(id);
        Project project = invitation.getProject();
        User user = invitation.getUser();
        //delete invitation once it's no longer needed
        invitationRepository.deleteById(id);

        project.addUser(user);
        return new ResponseEntity<>(projectRepository.save(project), HttpStatus.OK);
    }

    @DeleteMapping("invitations/{id}")
    public ResponseEntity<HttpStatus> deleteInvitation(@PathVariable("id") Long id) {
        invitationRepository.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
