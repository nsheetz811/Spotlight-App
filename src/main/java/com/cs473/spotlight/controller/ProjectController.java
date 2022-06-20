package com.cs473.spotlight.controller;

import com.cs473.spotlight.model.Project;
import com.cs473.spotlight.model.User;
import com.cs473.spotlight.repository.ProjectRepository;
import com.cs473.spotlight.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api")
public class ProjectController {
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/projects")
    public ResponseEntity<List<Project>> getAllProjects(Principal principal) {
        List<Project> projects = projectRepository.findAllByUsersId(principal.getName());
        return new ResponseEntity<>(projects, HttpStatus.OK);
    }

    @GetMapping("/projects/{id}")
    public ResponseEntity<?> getProjectById(@PathVariable("id") Long id, Principal principal) {
        Optional<Project> project = projectRepository.findByIdAndUsersId(id, principal.getName());
        return project.map(response -> new ResponseEntity<>(response, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.FORBIDDEN));
    }

    @GetMapping("/projects/{id}/users")
    public ResponseEntity<?> getUsersByProjectId(@PathVariable("id") Long id, Principal principal) {
        Optional<Project> project = projectRepository.findByIdAndUsersId(id, principal.getName());
        return project.map(response -> new ResponseEntity<>(response.getUsers(), HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.FORBIDDEN));
    }

    @PostMapping("/projects")
    public ResponseEntity<Project> createProject(@RequestBody Project project,
                                                 Principal principal) {
        String userId = principal.getName();
        User user = userRepository.findById(userId).orElse(null);
        project.addUser(user);

        return new ResponseEntity<>(projectRepository.save(project), HttpStatus.CREATED);
    }

    @PutMapping("/projects/{id}")
    public ResponseEntity<?> updateProject(@PathVariable("id") Long id, @RequestBody Project projectRequest) {
        Project project = projectRepository.findById(id).orElse(null);
        if (project != null) {
            project.setName(projectRequest.getName());
            project.setDate(projectRequest.getDate());
            return new ResponseEntity<>(projectRepository.save(project), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/projects/{projectId}/users/{userId}")
    public ResponseEntity<HttpStatus> deleteUserFromProject(@PathVariable("projectId") Long projectId,
                                                            @PathVariable("userId") String userId,
                                                            Principal principal) {
        User user = userRepository.findById(userId).orElse(null);
        Project project = projectRepository.findByIdAndUsersId(projectId, principal.getName()).orElse(null);

        if (user != null && project != null) {
            //prevent deleting last user
            if (project.getUsers().size() == 1)
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);

            project.removeUser(user.getId());
            projectRepository.save(project);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<HttpStatus> deleteProject(@PathVariable("id") Long id) {
        projectRepository.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
