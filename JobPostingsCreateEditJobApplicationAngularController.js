(function () {
            angular.module(APPNAME)
                .controller('jobApplicationController', JobApplicationController);

            JobApplicationController.$inject = ['$baseController', '$scope', '$window', '$sabio', 'jobApplicationService', '$sce'];

            function JobApplicationController($baseController, $scope, $window, $sabio, jobApplicationService, $sce) {
                var vm = this;
                vm.$scope = $scope;
                vm.$window = $window;
                $baseController.merge(vm, $baseController);
                vm.jobApplicationService = jobApplicationService;

                vm.awsAddress = $sabio.awsAddress;
                vm.indexOfSelectedApplication = -1;
                vm.selectedApplication = null;
                vm.applicationFilters = [];
                vm.selectedApplicationFilter = null;
                vm.notesEdit = false;
                vm.statusEdit = false;
                vm.applicationStatuses = [];
                vm.currentPage = 1;

                vm.viewApplication = _viewApplication;
                vm.viewResume = _viewResume;
                vm.saveApplication = _saveApplication;
                vm.closeApplication = _closeApplication;
                vm.changeApplicationFilter = _changeApplicationFilter;
                vm.editNotes = _editNotes;
                vm.changeStatus = _changeStatus;
                vm.sanitize = _sanitize;
                vm.changePage = _changePage;

                // Start up
                if (vm.$scope.$parent.jpVm.id) {
                    vm.jobApplicationService.getAllStatuses(_getStatusesSuccess, _getStatusesError);
                    _changePage();
                }

                // Button functions
                function _saveApplication() {
                    vm.selectedApplication.statusId = vm.selectedApplication.selectedStatus.id;
                    vm.jobApplicationService.put(vm.selectedApplication.id, vm.selectedApplication, _saveApplicationSuccess, _saveApplicationError)
                }

                function _closeApplication() {
                    _clearApplication();
                }

                function _changePage() {
                    var begin = ((vm.currentPage - 1) * 5);
                    var end = begin + 5;
                    if (vm.$scope.$parent.jpVm.posting.applications) {
                        vm.filteredApplications = vm.$scope.$parent.jpVm.posting.applications.slice(begin, end);
                        for (var i = 0; i < vm.filteredApplications.length; i++) {
                            vm.filteredApplications[i].color = "white";
                        }
                    }
                }

                // View application functions
                function _viewApplication(app) {
                    for (var i = 0; i < vm.filteredApplications.length; i++) {
                        vm.filteredApplications[i].color = "white";
                    }
                    vm.indexOfSelectedApplication = vm.$scope.$parent.jpVm.posting.applications.indexOf(app);
                    vm.selectedApplication = app;
                    vm.selectedApplication.color = "rgb(230, 230, 230)";
                    vm.selectedApplication.selectedStatus = vm.applicationStatuses.find(status => status.name == vm.selectedApplication.applicationStatus);
                }

                function _clearApplication() {
                    vm.selectedApplication = null;
                    for (var i = 0; i < vm.filteredApplications.length; i++) {
                        vm.filteredApplications[i].color = "white";
                    }
                }

                function _viewResume(resumeKey) {
                    var resumeString = "https://" + vm.awsAddress.bucket + "." + vm.awsAddress.baseUrl + "/" + vm.awsAddress.folder + "/" + resumeKey;
                    vm.$window.open(resumeString);
                }

                // Application status functions
                function _getStatusesSuccess(data) {
                    for (var i = 0; i < data.items.length; i++) {
                        vm.applicationStatuses.push(data.items[i]);
                    }
                    vm.$scope.$apply(function () {
                        vm.applicationFilters = data.items;
                        var getAll = {
                            id: 0,
                            name: "View All"
                        }
                        vm.applicationFilters.unshift(getAll);
                        vm.selectedApplicationFilter = vm.applicationFilters[0];
                    })
                }

                function _getStatusesError(data) {
                    toastr.error("Failed to get statuses");
                }

                function _changeApplicationFilter() {
                    vm.jobApplicationService.getByStatusId(vm.$scope.$parent.jpVm.posting.id, vm.selectedApplicationFilter.id, _filterApplicationSuccess, _filterApplicationError);
                }

                function _filterApplicationSuccess(data) {
                    vm.$scope.$apply(function () {
                        if (data.items) {
                            vm.$scope.$parent.jpVm.posting.applications = data.items;
                        } else {
                            vm.$scope.$parent.jpVm.posting.applications = [];
                        }
                        _changePage();
                    })
                }

                function _filterApplicationError(data) {
                    toastr.error("Failed to get applications");
                }

                // Application edit functions
                function _saveApplicationSuccess(data) {
                    vm.$scope.$apply(function () {
                        toastr.success("Appplication saved!");
                        vm.notesEdit = false;
                        vm.statusEdit = false;
                        vm.selectedApplication.applicationStatus = vm.selectedApplication.selectedStatus.name;
                        vm.$scope.$parent.jpVm.posting.applications.splice(vm.indexOfSelectedApplication, 1, vm.selectedApplication);
                    })
                }

                function _saveApplicationError(data) {
                    toastr.error("Failed to save application");
                }

                function _editNotes() {
                    vm.notesEdit = true;
                }

                function _changeStatus() {
                    vm.statusEdit = true;
                }

                function _sanitize(html_code) {
                    return $sce.trustAsHtml(html_code);
                }

            }
        })();