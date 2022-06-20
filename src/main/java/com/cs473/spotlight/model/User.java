package com.cs473.spotlight.model;

import javax.persistence.*;

@Entity
@Table(name = "user")
public class User {
    @Id
    private String id;
    @Column(name = "name")
    private String name;
    @Column(name = "email")
    private String email;

    public User() {}

    public User(String id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
