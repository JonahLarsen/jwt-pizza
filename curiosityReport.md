## Curiosity Report - How Git Works

### Introduction

Git is a version control system that allows programmers to iteratively edit their code with the ability to rollback changes and manage different branches. In class we have dicussed Git and Github and used many of their features, but I wanted to dig depper into how Git works, how it can store so many versions of files efficiently, and the history of version control overall.

### History

Git is by far the most popular version control system today, but it was only created in 2005. Prior to 2005 most developers used some form of local version control. One example is RCS (Revision Control System) which was created in 1982. The problem with local version control systems was that it was hard to use across teams, especially large teams or even entire organizations. RCS had a way to work across teams but it was not built to support big teams and had several drawbacks. It also was not designed to work well across mutltiple files and had poor branching support.

In the 90s new version control systems came out that had central servers where a whole team could collaborate, these allowed teams to view what other developers had done and have administrators manage all of the developers. The downside was that the repository had to exist on that server, and if developers could not access the server or the server went down, they could not use the version control system.

The next version of version control systems were distributed, meaning every developer keeps a copy of the whole repository on their computer, that is periodically synced between team members. This is what Git is.

### Why Git was created

When Linus Torvalds and other Linux kernel developers were working on the Linux kernel they used a distributed version control system called Bitkeeper. The choice to use Bitkeeper was controversial amongst some Linux kernel developers, and eventually after some controversy the Git project was started as an open source alternative that could be used for Linux development.

### How Git Works

Rather than storing a copy of every file for each commit, Git stores SHA-1 hash references for each file and stores the contents of each file in an object called a blob. It then uses delta compression, where the common parts of two objects are stored along with instructions on how to find the differences (deltas) to scan through the objects in a repository and store matching file segments in blobs.

Essentially, much of the common content in files is extracted and put into a singular blob, and then all the blobs for a given commit are packaged together in a tree object. The tree stores the names of each file with references to the hashes of each blob. Each tree has a single hash the identifies it and these are packaged together into a commit object to show the sequential history. When a repository needs to rollback to a previous commit, git reconstructs the file by going through the tree of blobs associated with that commit and pieces them back together.

This allows Git to store large amounts of sequential changes to files without ballooning in storage size. Everything that is common between different versions will get pulled out using delta compression, meaning that only the small deltas add to the storage size with each commit.

### How Git relates to DevOps

Modern software development often uses an Agile development cycle, where software is built piece by piece with features being added iteratively over time. Version control systems becomes are even more important in this type of software development because the codebase will be edited in perpetuity. New features will be added rapidly, when bugs inevitably get added, Git makes it possible to quickly rollback to a previous version.

Git also makes it easy to create several branches that can be used for different purposes. For example you might want to have a branch for production, testing, staging, betas, etc. Git makes it easy to maintain multiple branches that are configured to support those different use cases.

### Summary

It was interesting to research the technical details behind Git. I have used Git extensively for school and work but have never understood what it is actually doing. I have wonderd how it can run efficiently and not grow into unmanageable sizes over time. Learning about delta compression was very interesting and makes sense.
